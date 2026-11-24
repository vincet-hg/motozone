import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import type { AdminUser } from "@/lib/types";
import { setAdmin } from "../../actions";
import { ConfirmButton } from "../../ui";
import { formatDate } from "../orders/status";

type Search = { q?: string; page?: string; error?: string; saved?: string };

const PAGE = 50;

const PROVIDERS: Record<string, string> = { email: "ელფოსტა", google: "Google", phone: "ტელეფონი" };

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  if (role === "super") return <span className="rounded-full border border-a-violet/50 bg-a-purple/25 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white">მთავარი ადმინი</span>;
  if (role === "admin") return <span className="rounded-full border border-a-blue/40 bg-a-blue/15 px-2 py-0.5 text-xs font-semibold text-[#9cc3ff]">ადმინი</span>;
  return <span className="text-xs text-a-muted">მომხმარებელი</span>;
}

// Every account on the site. Any admin sees the list; only the super admin adds or removes admins.
export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", page = "1", error, saved } = await searchParams;
  const supabase = await requireAdmin();
  const current = Math.max(1, Math.floor(Number(page)) || 1);

  const [{ data: rows, error: loadError }, { data: access }, { data: everyone }] = await Promise.all([
    supabase.rpc("admin_users", { p_search: q.trim(), p_limit: PAGE, p_offset: (current - 1) * PAGE }),
    supabase.rpc("admin_access"),
    supabase.rpc("every_account_is_admin"),
  ]);
  const users = (rows ?? []) as AdminUser[];
  const total = Number(users[0]?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const isSuper = access === "super";

  const link = (next: number) => {
    const params = new URLSearchParams({ ...(q ? { q } : {}), ...(next > 1 ? { page: String(next) } : {}) }).toString();
    return params ? `/admin/users?${params}` : "/admin/users";
  };
  const back = link(current);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">მომხმარებლები ({total})</h1>
        <form className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <input name="q" defaultValue={q} placeholder="ელფოსტა, ტელეფონი ან სახელი" aria-label="მომხმარებლის ძიება" className="h-9 min-w-0 flex-1 rounded-xl border px-3 text-sm sm:w-72 sm:flex-none" />
          <button className="h-9 rounded-xl border border-a-line bg-a-panel px-3 text-sm transition-colors hover:border-a-violet/60">ძებნა</button>
        </form>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-a-soft">
        ყველა, ვინც საიტზე ანგარიში შექმნა. {isSuper ? "ადმინად დანიშვნა და მოხსნა აქედან შეგიძლია." : "ადმინებს მხოლოდ მთავარი ადმინი ნიშნავს და ხსნის."}
      </p>

      {everyone && (
        <p role="status" className="mt-3 max-w-3xl rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          სატესტო გარემო: აქ ყველა ანგარიშს აქვს ადმინში შესვლის უფლება. ეს მხოლოდ ამ სატესტო ბაზას ეხება, production-ს არა.
        </p>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{error}</p>}
      {saved && (
        <p role="status" className="mt-3 rounded-xl border border-a-green/30 bg-a-green/10 p-3 text-sm text-[#5fe0a0]">
          {saved === "granted" ? "ადმინად დაინიშნა. პირველ შესვლაზე ავთენტიკატორის დაყენებას მოსთხოვს." : "ადმინის უფლება მოხსნილია."}
        </p>
      )}
      {loadError && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">სია ვერ ჩაიტვირთა. სცადე თავიდან.</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="text-a-soft">
              <th className="px-4 py-3 font-medium">მომხმარებელი</th>
              <th className="px-4 py-3 font-medium">შესვლის გზა</th>
              <th className="px-4 py-3 font-medium">რეგისტრაცია</th>
              <th className="px-4 py-3 font-medium">ბოლო შესვლა</th>
              <th className="px-4 py-3 font-medium">შეკვეთები</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              {isSuper && <th className="px-4 py-3 font-medium"><span className="sr-only">მოქმედება</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-a-line/60">
            {users.map((user) => {
              const label = user.email ?? user.phone ?? user.id;
              return (
                <tr key={user.id} className="align-middle">
                  <td className="px-4 py-3">
                    <span className="block max-w-[260px] truncate font-medium">{user.email ?? user.phone ?? "-"}</span>
                    {(user.name || (user.email && user.phone)) && (
                      <span className="block max-w-[260px] truncate text-xs text-a-muted">{[user.name, user.email ? user.phone : null].filter(Boolean).join(" · ")}</span>
                    )}
                    {!user.confirmed && <span className="mt-0.5 block text-xs text-amber-300">ელფოსტა დაუდასტურებელია</span>}
                  </td>
                  <td className="px-4 py-3 text-a-soft">{user.providers.map((provider) => PROVIDERS[provider] ?? provider).join(", ") || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-a-soft">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-a-soft">{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "-"}</td>
                  <td className={`px-4 py-3 ${user.orders > 0 ? "font-semibold" : "text-a-muted"}`}>{user.orders}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                    {user.role && !user.has_password && <span className="mt-1 block text-xs text-amber-300">პაროლი არ აქვს: ჯერ "დაგავიწყდა პაროლი?"-ით უნდა დააყენოს</span>}
                  </td>
                  {isSuper && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {user.role === "super" ? (
                        <span className="text-xs text-a-muted">დაცულია</span>
                      ) : (
                        <form action={setAdmin}>
                          <input type="hidden" name="user_id" value={user.id} />
                          <input type="hidden" name="admin" value={user.role ? "0" : "1"} />
                          <input type="hidden" name="back" value={back} />
                          {user.role ? (
                            <ConfirmButton message={`${label}-ს ადმინის უფლება მოვუხსნა?`} className="cursor-pointer rounded-lg border border-a-red/40 px-3 py-1.5 text-xs font-semibold text-[#ff8a94] transition-colors hover:bg-a-red/10">
                              ადმინის მოხსნა
                            </ConfirmButton>
                          ) : (
                            <ConfirmButton
                              message={`${label} დავნიშნო ადმინად? შეეძლება შეკვეთების, პროდუქტების და ფასების მართვა.${user.has_password ? "" : " ამ ანგარიშს პაროლი არ აქვს, ადმინში შესასვლელად ჯერ უნდა დააყენოს."}`}
                              className="cursor-pointer rounded-lg border border-a-line bg-a-panel px-3 py-1.5 text-xs font-semibold transition-colors hover:border-a-violet/60"
                            >
                              ადმინად დანიშვნა
                            </ConfirmButton>
                          )}
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {users.length === 0 && !loadError && (
              <tr>
                <td colSpan={isSuper ? 7 : 6} className="p-6 text-center text-a-soft">
                  {q ? "ვერავინ მოიძებნა." : "ჯერ არავის შეუქმნია ანგარიში."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="გვერდები" className="mt-4 flex items-center justify-between text-sm">
          {current > 1 ? <Link href={link(current - 1)} prefetch={false} className="rounded-xl border border-a-line bg-a-panel px-3 py-1.5 hover:border-a-violet/60">← წინა</Link> : <span />}
          <span className="text-a-soft">{current} / {pages}</span>
          {current < pages ? <Link href={link(current + 1)} prefetch={false} className="rounded-xl border border-a-line bg-a-panel px-3 py-1.5 hover:border-a-violet/60">შემდეგი →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
