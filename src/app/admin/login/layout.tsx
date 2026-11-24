import { isDemo } from "@/lib/demo";
import { DEMO_EMAIL, DEMO_LOGIN_IS_DEFAULT, DEMO_PASSWORD } from "@/lib/demo-data";

// A server component, so the demo login never reaches the browser bundle.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {isDemo && DEMO_LOGIN_IS_DEFAULT && (
        <p className="bg-gradient-to-r from-a-purple to-a-violet px-3 py-2 text-center text-sm font-medium text-white">
          დემო შესვლა: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
      )}
      {children}
    </>
  );
}
