"use client";

import { useEffect, useState } from "react";

// When an order came in: how long ago (refreshed every minute) and the exact Tbilisi date and time.
// Built by hand from en-GB parts: Georgian month names and a 24-hour clock look the same on the server
// and in every browser (ka-GE support varies, and a mismatch breaks hydration).
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
const tbilisiFormat = new Intl.DateTimeFormat("en-GB", {
  year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Tbilisi",
});
function tbilisiParts(date: Date | number) {
  const get = (type: string) => tbilisiFormat.formatToParts(date).find((part) => part.type === type)?.value ?? "";
  return { year: get("year"), month: Number(get("month")), day: Number(get("day")), time: `${get("hour")}:${get("minute")}` };
}
const formatTime = (date: Date) => tbilisiParts(date).time;
const formatFullDate = (date: Date) => {
  const { day, month, year, time } = tbilisiParts(date);
  return `${day} ${MONTHS[month - 1]} ${year}, ${time}`;
};
// The same text for two moments on the same Tbilisi calendar day.
const dayKey = (date: Date | number) => {
  const { day, month, year } = tbilisiParts(date);
  return `${year}-${month}-${day}`;
};

function timeAgo(date: Date, now: number) {
  const minutes = Math.floor((now - date.getTime()) / 60000);
  if (minutes < 1) return "ახლახან";
  if (minutes < 60) return `${minutes} წთ წინ`;
  if (dayKey(date) === dayKey(now)) return `დღეს, ${formatTime(date)}`;
  if (dayKey(date) === dayKey(now - 86400000)) return `გუშინ, ${formatTime(date)}`;
  const days = Math.floor(minutes / 1440);
  return days < 7 ? `${days} დღის წინ` : formatFullDate(date);
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

  const isRecent = now !== null && now - date.getTime() < 3600000;
  return (
    <time dateTime={value} title={formatFullDate(date)} className={`block leading-tight ${className}`}>
      <span className={`block font-medium ${isRecent ? "text-[#5fe0a0]" : "text-a-text"}`}>{now === null ? formatTime(date) : timeAgo(date, now)}</span>
      <span className="block text-xs text-a-muted">{formatFullDate(date)}</span>
    </time>
  );
}
