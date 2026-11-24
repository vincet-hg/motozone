"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { toE164 } from "@/lib/account";
import { isDemo } from "@/lib/demo";
import { DEMO_CUSTOMER_COOKIE, DEMO_PHONE_CODE, demoConfirm, demoPhoneSignIn, demoSetPassword, demoSignIn, demoSignUp, demoUserByEmail } from "@/lib/demo-accounts";
import { lockedError, recordFailure, recordSuccess } from "@/lib/login-lockout";
import { isWithinRateLimit, getClientIp } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase-server";

// step "code": waiting for the SMS or email code; "confirm": a new account waiting for the email code.
export type AuthState = { error?: string; info?: string; phone?: string; email?: string; step?: "code" | "confirm" };

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
  return !(await isWithinRateLimit(scope, await getClientIp(), 10, 600));
}

const SLOW = "ძალიან ბევრი მცდელობაა. სცადე რამდენიმე წუთში.";
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Supabase email codes are 6 digits by default (up to 10 if changed in the dashboard).
const emailCode = (form: FormData) => text(form, "code").replace(/\s/g, "");
const isCode = (code: string) => /^[0-9]{6,10}$/.test(code);
const demoNote = isDemo ? ` დემო რეჟიმი: კოდია ${DEMO_PHONE_CODE}.` : "";
const confirmInfo = (email: string) => `6-ნიშნა კოდი გამოგიგზავნეთ ${email}-ზე. ჩაწერე ქვემოთ. თუ ვერ ხედავ, შეამოწმე Spam.${demoNote}`;

export async function signInWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "შეიყვანე ელფოსტა და პაროლი." };
  if (await tooFast("login")) return { error: SLOW };
  // Wrong passwords lock the account for longer each time (see src/lib/login-lockout.ts).
  const locked = await lockedError("customer", email);
  if (locked) return { error: locked };

  if (isDemo) {
    const user = demoSignIn(email, password);
    if (!user) return { error: "ელფოსტა ან პაროლი არასწორია." };
    if (user.confirmed === false) return { step: "confirm", email, info: confirmInfo(email), error: "ჯერ დაადასტურე ელფოსტა." };
    await demoSession(user.id);
  } else {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "email_not_confirmed") {
        await supabase.auth.resend({ type: "signup", email });
        return { step: "confirm", email, info: confirmInfo(email), error: "ჯერ დაადასტურე ელფოსტა." };
      }
      // Supabase's own limit is not a wrong password, so it does not count toward the lock.
      if (error.code === "over_request_rate_limit") return { error: SLOW };
      return { error: (await recordFailure("customer", email)) ?? "ელფოსტა ან პაროლი არასწორია." };
    }
    await recordSuccess("customer", email);
  }
  redirect(safeNext(form.get("next")));
}

export async function signUpWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!EMAIL.test(email)) return { error: "შეიყვანე სწორი ელფოსტა." };
  if (password.length < 8) return { error: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო." };
  if (await tooFast("signup")) return { error: SLOW };
  const next = safeNext(form.get("next"));

  if (isDemo) {
    const result = demoSignUp(email, password);
    if ("error" in result) return { error: "ამ ელფოსტით ანგარიში უკვე არსებობს. შედი ან აღადგინე პაროლი." };
    return { step: "confirm", email, info: confirmInfo(email) };
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
  // With email confirmation on, Supabase returns no session until the code (or the link) from the email is used.
  if (!data.session) return { step: "confirm", email, info: confirmInfo(email) };
  redirect(next);
}

// The code from the "confirm your email" message. Signs the new customer in.
export async function confirmEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const code = emailCode(form);
  if (!EMAIL.test(email)) return { error: "დაიწყე თავიდან." };
  if (!isCode(code)) return { step: "confirm", email, error: "ჩაწერე კოდი წერილიდან." };
  if (await tooFast("confirm")) return { step: "confirm", email, error: SLOW };

  if (isDemo) {
    if (code !== DEMO_PHONE_CODE) return { step: "confirm", email, error: "კოდი არასწორია." };
    const user = demoConfirm(email);
    if (!user) return { error: "ანგარიში ვერ მოიძებნა. დარეგისტრირდი თავიდან." };
    await demoSession(user.id);
  } else {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) return { step: "confirm", email, error: "კოდი არასწორია ან ვადა გაუვიდა. მოითხოვე ახალი." };
  }
  redirect(safeNext(form.get("next")));
}

export async function resendConfirmation(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  if (!EMAIL.test(email)) return { error: "დაიწყე თავიდან." };
  if (!(await isWithinRateLimit("resend", email, 3, 3600))) return { step: "confirm", email, error: SLOW };
  if (!isDemo) {
    const supabase = await createAdminClient();
    await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${site.url}/auth/callback?next=/account` } });
  }
  return { step: "confirm", email, info: `ახალი კოდი გამოგიგზავნეთ ${email}-ზე.${demoNote}` };
}

export async function sendPhoneCode(_: AuthState, form: FormData): Promise<AuthState> {
  const phone = toE164(text(form, "phone"));
  if (!phone) return { error: "შეიყვანე მობილურის ნომერი, მაგალითად 599 12 34 56." };
  if (!site.auth.phone) return { error: "ტელეფონით შესვლა ჯერ ჩართული არ არის." };
  // Each SMS costs money, so codes are limited per visitor and per number.
  if (!(await isWithinRateLimit("sms-ip", await getClientIp(), 5, 3600)) || !(await isWithinRateLimit("sms-phone", phone, 3, 3600))) return { error: SLOW };

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

// Step 1 of a forgotten password: a code (and a link, for those who prefer it) goes to the email.
export async function sendPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  if (!EMAIL.test(email)) return { error: "შეიყვანე სწორი ელფოსტა." };
  if (await tooFast("reset") || !(await isWithinRateLimit("reset-email", email, 3, 3600))) return { error: SLOW };
  if (!isDemo) {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site.url}/auth/callback?next=/account/password` });
    if (error && error.status !== 400) console.error("password reset failed", error.code, error.message);
  }
  // The same answer whether or not the account exists, so the form cannot be used to look up emails.
  return { step: "code", email, info: `თუ ${email} დარეგისტრირებულია, მასზე 6-ნიშნა კოდი გამოგიგზავნეთ. თუ ვერ ხედავ, შეამოწმე Spam.${demoNote}` };
}

// Step 2: the code from the email and the new password. Signs the customer in.
export async function resetPasswordWithCode(_: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, "email").toLowerCase();
  const code = emailCode(form);
  const password = String(form.get("password") ?? "");
  const back = { step: "code" as const, email };
  if (!EMAIL.test(email)) return { error: "დაიწყე თავიდან." };
  if (!isCode(code)) return { ...back, error: "ჩაწერე კოდი წერილიდან." };
  if (password.length < 8) return { ...back, error: "ახალი პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო." };
  if (password !== String(form.get("password2") ?? "")) return { ...back, error: "პაროლები ერთმანეთს არ ემთხვევა." };
  if (await tooFast("reset-verify")) return { ...back, error: SLOW };

  if (isDemo) {
    const user = demoUserByEmail(email);
    if (!user || code !== DEMO_PHONE_CODE) return { ...back, error: "კოდი არასწორია ან ვადა გაუვიდა." };
    demoSetPassword(user.id, password);
    demoConfirm(email);
    await demoSession(user.id);
  } else {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
    if (error) return { ...back, error: "კოდი არასწორია ან ვადა გაუვიდა. მოითხოვე ახალი." };
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      if (updateError.code === "same_password") return { ...back, error: "ახალი პაროლი ძველს არ უნდა ემთხვეოდეს." };
      if (updateError.code === "weak_password") return { ...back, error: "პაროლი ძალიან მარტივია." };
      return { ...back, error: "პაროლი ვერ შეიცვალა. სცადე თავიდან." };
    }
    // The email code proves the owner, so a lock from wrong passwords ends here.
    await recordSuccess("customer", email);
  }
  redirect("/account?password=changed");
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
