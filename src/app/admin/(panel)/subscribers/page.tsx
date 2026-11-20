import { requireAdmin } from "@/lib/supabase-server";
import type { Subscriber } from "@/lib/types";
import { deleteSubscriber } from "../../actions";
import { ConfirmButton } from "../../ui";
import { formatDate } from "../orders/status";

export default async function SubscribersPage() {
  const supabase = await requireAdmin();
  const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(5000);
  const subscribers = (data ?? []) as Subscriber[];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">გამომწერები ({subscribers.length})</h1>
      <p className="mt-1 max-w-3xl text-sm text-a-soft">
        მთავარი გვერდიდან გამოწერილი ელფოსტები. წერილის გაგზავნისას ყოველთვის მიუთითე, როგორ გააუქმონ გამოწერა. ვინც გაუქმებას ითხოვს, აქედან წაშალე.
      </p>

      {subscribers.length > 0 && (
        <label className="mt-4 block max-w-3xl text-sm">
          ყველა ელფოსტა ერთად (დააკოპირე წერილის გასაგზავნად)
          <textarea readOnly rows={4} value={subscribers.map((row) => row.email).join(", ")} className="mt-1 w-full rounded-lg border border-a-line bg-a-card p-2 font-mono text-xs" />
        </label>
      )}

      <ul className="mt-4 max-w-3xl divide-y divide-a-line/60 rounded-2xl border border-a-line bg-a-card text-sm shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        {subscribers.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 p-2">
            <span className="min-w-0 truncate">{row.email}</span>
            <span className="ml-auto shrink-0 text-a-muted">{formatDate(row.created_at)}</span>
            <form action={deleteSubscriber}>
              <input type="hidden" name="id" value={row.id} />
              <ConfirmButton message={`წავშალო ${row.email}?`} className="text-[#ff6b77] underline">
                წაშლა
              </ConfirmButton>
            </form>
          </li>
        ))}
        {subscribers.length === 0 && <li className="p-6 text-center text-a-soft">ჯერ გამომწერი არ არის.</li>}
      </ul>
    </>
  );
}
