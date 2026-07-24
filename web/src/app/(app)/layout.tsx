import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isMockAiMode, isMockPaymentMode } from "@/lib/env";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Company profile" },
  { href: "/jobs", label: "Jobs" },
];

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const mockBanners: string[] = [];
  if (isMockAiMode()) mockBanners.push("MOCK AI MODE — GEMINI_API_KEY not configured; agent outputs are labeled fixtures, not production AI.");
  if (isMockPaymentMode()) mockBanners.push("MOCK PAYMENT MODE — STRIPE_SECRET_KEY not configured; checkout creates jobs without charging.");
  else if (session.isDemoOrganization || session.isJudgeMember) {
    mockBanners.push("XPRIZE JUDGE / DEMO ACCESS — checkout is free for this account; purchases are excluded from arms-length revenue.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold tracking-tight text-slate-900">
              Bid<span className="text-blue-600">Pilot</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-slate-600">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
              {session.isAdmin && (
                <Link href="/admin/xprize-readiness" className="text-purple-700 hover:text-purple-900">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:block text-slate-500">
              {session.organizationName ?? session.user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-slate-600 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {mockBanners.map((msg) => (
        <div
          key={msg}
          className="bg-amber-100 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-medium text-amber-900"
        >
          {msg}
        </div>
      ))}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
