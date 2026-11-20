"use client";

import { useEffect, useState } from "react";

// When an order came in: how long ago (refreshed every minute) and the exact Tbilisi date and time.
// Built by hand from en-GB parts: Georgian month names and a 24-hour clock look the same on the server
// and in every browser (ka-GE support varies, and a mismatch breaks hydration).
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
const partsFormat = new Intl.DateTimeFormat("en-GB", {
  year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Tbilisi",
});
function parts(date: Date | number) {
  const get = (type: string) => partsFormat.formatToParts(date).find((part) => part.type === type)?.value ?? "";
  return { year: get("year"), month: Number(get("month")), day: Number(get("day")), time: `${get("hour")}:${get("minute")}` };
}
const clock = { format: (date: Date) => parts(date).time };
const exact = {
  format: (date: Date) => {
    const p = parts(date);
    return `${p.day} ${MONTHS[p.month - 1]} ${p.year}, ${p.time}`;
  },
};
const day = { format: (date: Date | number) => { const p = parts(date); return `${p.year}-${p.month}-${p.day}`; } };

function ago(date: Date, now: number) {
  const minutes = Math.floor((now - date.getTime()) / 60000);
  if (minutes < 1) return "ახლახან";
  if (minutes < 60) return `${minutes} წთ წინ`;
  if (day.format(date) === day.format(now)) return `დღეს, ${clock.format(date)}`;
  if (day.format(date) === day.format(now - 86400000)) return `გუშინ, ${clock.format(date)}`;
  const days = Math.floor(minutes / 1440);
  return days < 7 ? `${days} დღის წინ` : exact.format(date);
}

export function OrderTime({ value, className = "" }: { value: string; className?: string }) {
  const date = new Date(value);
  // The relative part needs the visitor's clock, so it appears after the page loads.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const fresh = now !== null && now - date.getTime() < 3600000;
  return (
    <time dateTime={value} title={exact.format(date)} className={`block leading-tight ${className}`}>
      <span className={`block font-medium ${fresh ? "text-[#5fe0a0]" : "text-a-text"}`}>{now === null ? clock.format(date) : ago(date, now)}</span>
      <span className="block text-xs text-a-muted">{exact.format(date)}</span>
    </time>
  );
}
