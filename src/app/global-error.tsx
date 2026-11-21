"use client";

// Last resort when even the root layout fails. It renders its own document, so styles are inline.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ka">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d10", color: "#f5f5f5", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 16 }}>
        <title>Scooter Land</title>
        <main>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, opacity: 0.85 }}>!</div>
          <h1 style={{ fontSize: 26, margin: "24px 0 8px" }}>საიტი ამ წამს ვერ ჩაიტვირთა</h1>
          <p style={{ color: "#a1a1aa", margin: "0 0 24px" }}>სცადე თავიდან რამდენიმე წამში ან დაგვირეკე: +995 599 03 33 72</p>
          <button onClick={retry} style={{ height: 48, padding: "0 24px", border: 0, borderRadius: 12, background: "#e3120b", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            თავიდან ცდა
          </button>
        </main>
      </body>
    </html>
  );
}
