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
      <h1 className="text-xl font-bold">გამომწერები ({subscribers.length})</h1>
      <p className="mt-1 max-w-3xl text-sm text-neutral-700">
        მთავარი გვერდიდან გამოწერილი ელფოსტები. წერილის გაგზავნისას ყოველთვის მიუთითე, როგორ გააუქმონ გამოწერა. ვინც გაუქმებას ითხოვს, აქედან წაშალე.
      </p>

      {subscribers.length > 0 && (
        <label className="mt-4 block max-w-3xl text-sm">
          ყველა ელფოსტა ერთად (დააკოპირე წერილის გასაგზავნად)
          <textarea readOnly rows={4} value={subscribers.map((row) => row.email).join(", ")} className="mt-1 w-full rounded border border-neutral-300 bg-white p-2 font-mono text-xs" />
        </label>
      )}

      <ul className="mt-4 max-w-3xl divide-y divide-neutral-100 rounded border border-neutral-200 bg-white text-sm">
        {subscribers.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 p-2">
            <span className="min-w-0 truncate">{row.email}</span>
            <span className="ml-auto shrink-0 text-neutral-600">{formatDate(row.created_at)}</span>
            <form action={deleteSubscriber}>
              <input type="hidden" name="id" value={row.id} />
              <ConfirmButton message={`წავშალო ${row.email}?`} className="text-red-700 underline">
                წაშლა
              </ConfirmButton>
            </form>
          </li>
        ))}
        {subscribers.length === 0 && <li className="p-6 text-center text-neutral-700">ჯერ გამომწერი არ არის.</li>}
      </ul>
    </>
  );
}
