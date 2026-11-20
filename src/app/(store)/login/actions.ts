"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { toE164 } from "@/lib/account";
import { isDemo } from "@/lib/demo";
import { DEMO_CUSTOMER_COOKIE, DEMO_PHONE_CODE, demoPhoneSignIn, demoSetPassword, demoSignIn, demoSignUp } from "@/lib/demo-accounts";
import { allow, clientIp } from "@/lib/request-guard";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase-server";

export type AuthState = { error?: string; info?: string; phone?: string; step?: "code" };

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

// Only paths on this site, so a crafted link cannot send a customer elsewhere after sign-in.
function safeNext(value: FormDataEntryValue | string | null) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin") ? next : "/account";
}

async function demoSession(id: string) {
  (await cookies()).set(DEMO_CUSTOMER_COOKIE, id, { sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

async function tooFast(scope: string) {
  return !(await allow(scope, await clientIp(), 10, 600));
}

const SLOW = "ძალიან ბევრი მცდელობაა. სცადე რამდენიმე წუთში.";

export async function signInWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "შეიყვანე ელფოსტა და პაროლი." };
  if (await tooFast("login")) return { error: SLOW };

  if (isDemo) {
    const user = demoSignIn(email, password);
    if (!user) return { error: "ელფოსტა ან პაროლი არასწორია." };
    await demoSession(user.id);
  } else {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "email_not_confirmed") return { error: "ჯერ დაადასტურე ელფოსტა: გახსენი წერილი, რომელიც რეგისტრაციისას გამოგიგზავნეთ." };
      return { error: "ელფოსტა ან პაროლი არასწორია." };
    }
  }
  redirect(safeNext(form.get("next")));
}

export async function signUpWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "შეიყვანე სწორი ელფოსტა." };
  if (password.length < 8) return { error: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო." };
  if (await tooFast("signup")) return { error: SLOW };
  const next = safeNext(form.get("next"));

  if (isDemo) {
    const result = demoSignUp(email, password);
    if ("error" in result) return { error: "ამ ელფოსტით ანგარიში უკვე არსებობს. შედი ან აღადგინე პაროლი." };
    await demoSession(result.user.id);
    redirect(next);
  }

  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    if (error.code === "weak_password") return { error: "პაროლი ძალიან მარტივია. გამოიყენე უფრო გრძელი პაროლი." };
    if (error.code === "user_already_exists") return { error: "ამ ელფოსტით ანგარიში უკვე არსებობს. შედი ან აღადგინე პაროლი." };
    console.error("signUp failed", error.code, error.message);
    return { error: "რეგისტრაცია ვერ მოხერხდა. სცადე თავიდან." };
  }
  // With email confirmation on, Supabase returns no session until the link in the email is opened.
  if (!data.session) return { info: `დადასტურების წერილი გამოგიგზავნეთ მისამართზე ${email}. გახსენი ბმული და ანგარიში მზად იქნება.` };
  redirect(next);
}

export async function sendPhoneCode(_: AuthState, form: FormData): Promise<AuthState> {
  const phone = toE164(text(form, "phone"));
  if (!phone) return { error: "შეიყვანე მობილურის ნომერი, მაგალითად 599 12 34 56." };
  if (!site.auth.phone) return { error: "ტელეფონით შესვლა ჯერ ჩართული არ არის." };
  // Each SMS costs money, so codes are limited per visitor and per number.
  if (!(await allow("sms-ip", await clientIp(), 5, 3600)) || !(await allow("sms-phone", phone, 3, 3600))) return { error: SLOW };

  if (!isDemo) {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      console.error("signInWithOtp failed", error.code, error.message);
      return { error: "კოდი ვერ გაიგზავნა. შეამოწმე ნომერი და სცადე თავიდან." };
    }
  }
  return { step: "code", phone, info: isDemo ? `დემო რეჟიმი: კოდია ${DEMO_PHONE_CODE}.` : "SMS კოდი გამოგიგზავნეთ." };
}

export async function verifyPhoneCode(_: AuthState, form: FormData): Promise<AuthState> {
  const phone = toE164(text(form, "phone"));
  const code = text(form, "code").replace(/\s/g, "");
  if (!phone) return { error: "ნომერი არასწორია. დაიწყე თავიდან." };
  if (!/^[0-9]{6}$/.test(code)) return { step: "code", phone, error: "შეიყვანე 6-ნიშნა კოდი." };
  if (await tooFast("sms-verify")) return { step: "code", phone, error: SLOW };

  if (isDemo) {
    if (code !== DEMO_PHONE_CODE) return { step: "code", phone, error: "კოდი არასწორია." };
    await demoSession(demoPhoneSignIn(phone).id);
  } else {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    if (error) return { step: "code", phone, error: "კოდი არასწორია ან ვადა გაუვიდა." };
  }
  redirect(safeNext(form.get("next")));
}

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(form.get("next"));
  if (isDemo || !site.auth.google) redirect(`/login?next=${encodeURIComponent(next)}`);
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    console.error("Google sign-in failed", error?.message);
    redirect("/login?error=google");
  }
  redirect(data.url);
}

export async function sendPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "შეიყვანე სწორი ელფოსტა." };
  if (await tooFast("reset")) return { error: SLOW };
  if (!isDemo) {
    const supabase = await createAdminClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site.url}/auth/callback?next=/account/password` });
  }
  // The same answer whether or not the account exists, so the form cannot be used to look up emails.
  return { info: "თუ ამ ელფოსტით ანგარიში არსებობს, პაროლის აღდგენის ბმულს მიიღებ რამდენიმე წუთში." };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო." };
  if (isDemo) {
    const id = (await cookies()).get(DEMO_CUSTOMER_COOKIE)?.value;
    if (!id) redirect("/login");
    demoSetPassword(id, password);
    return { info: "პაროლი შეიცვალა." };
  }
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "ახალი პაროლი ძველს არ უნდა ემთხვეოდეს." };
    if (error.code === "weak_password") return { error: "პაროლი ძალიან მარტივია." };
    return { error: "პაროლი ვერ შეიცვალა. შედი თავიდან და სცადე." };
  }
  return { info: "პაროლი შეიცვალა." };
}

export async function signOut() {
  if (isDemo) (await cookies()).delete(DEMO_CUSTOMER_COOKIE);
  else await (await createAdminClient()).auth.signOut({ scope: "local" });
  redirect("/");
}
