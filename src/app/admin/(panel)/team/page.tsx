import { isDemo } from "@/lib/demo";
import { requireOwner } from "@/lib/supabase-server";
import { removeAdmin } from "../../actions";
import { ConfirmButton } from "../../ui";
import { formatDate } from "../orders/status";
import { AddAdminForm, ResetAccessButton } from "./team-forms";

type Member = { user_id: string; email: string; role: "owner" | "admin"; created_at: string; last_sign_in_at: string | null };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const notice = await searchParams;
  const supabase = await requireOwner();
  const { data } = isDemo ? { data: [] } : await supabase.rpc("list_admins");
  const team = (data ?? []) as Member[];

  return (
    <>
      <h1 className="text-xl font-bold">გუნდი</h1>
      <p className="mt-1 max-w-3xl text-sm text-neutral-700">
        ამ გვერდს მხოლოდ შენ, მფლობელი, ხედავ. აქ ამატებ და შლი ადმინებს. ადმინს შეუძლია შეკვეთების, პროდუქტების და მარაგის მართვა, მაგრამ ადმინებს ვერ ამატებს
        და ვერ შლის. ამას ბაზაც ამოწმებს.
      </p>
      {isDemo && <p className="mt-3 rounded bg-amber-100 p-2 text-sm text-amber-950">დემო რეჟიმში ადმინების მართვა შეუძლებელია. სცადე სატესტო ბაზაზე.</p>}
      {notice.saved && <p role="status" className="mt-3 rounded bg-green-100 p-2 text-sm text-green-900">{notice.saved}</p>}
      {notice.error && <p role="alert" className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800">{notice.error}</p>}

      <AddAdminForm />

      <ul className="mt-6 max-w-3xl divide-y divide-neutral-100 rounded border border-neutral-200 bg-white text-sm">
        {team.map((member) => (
          <li key={member.user_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{member.email}</span>
              <span className="block text-xs text-neutral-600">
                {member.role === "owner" ? "მფლობელი" : "ადმინი"} · დაემატა {formatDate(member.created_at)} · ბოლოს შევიდა{" "}
                {member.last_sign_in_at ? formatDate(member.last_sign_in_at) : "ჯერ არა"}
              </span>
            </span>
            {member.role === "admin" && (
              <>
                <ResetAccessButton userId={member.user_id} email={member.email} />
                <form action={removeAdmin}>
                  <input type="hidden" name="user_id" value={member.user_id} />
                  <ConfirmButton message={`მოვუხსნა ადმინის უფლება ${member.email}-ს?`} className="text-red-700 underline">
                    წაშლა
                  </ConfirmButton>
                </form>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
