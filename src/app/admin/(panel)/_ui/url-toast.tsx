"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/toaster";

// Admin actions redirect with ?saved=, ?warning= or ?error=. Each new one also shows as a toast.
const SAVED: Record<string, string> = {
  "1": "შენახულია.",
  granted: "ადმინად დაინიშნა.",
  revoked: "ადმინის უფლება მოხსნილია.",
};

export function UrlToast() {
  const params = useSearchParams();
  const saved = params.get("saved");
  const warning = params.get("warning");
  const error = params.get("error");

  useEffect(() => {
    if (error) toast(error, "error");
    else if (warning) toast(warning, "warning");
    else if (saved) toast(SAVED[saved] ?? saved, "success");
  }, [saved, warning, error]);

  return null;
}
