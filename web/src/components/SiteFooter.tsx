import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm text-slate-600">
        <div>
          <div className="font-bold text-slate-900 mb-2">BidPilot</div>
          <p>
            An AI-operated proposal department for small businesses pursuing
            government, institutional, and commercial contracts.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-slate-900">Product</div>
          <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
          <Link href="/sample" className="hover:text-slate-900">Sample report</Link>
          <Link href="/how-it-works" className="hover:text-slate-900">How it works</Link>
          <Link href="/xprize" className="hover:text-slate-900">XPRIZE transparency</Link>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-slate-900">Important</div>
          <Link href="/trust" className="hover:text-slate-900">Trust &amp; safety</Link>
          <p className="text-xs text-slate-500 mt-2">
            BidPilot does not promise contract awards, provide legal advice, or
            submit bids on your behalf. You approve all pricing, certifications,
            and final submissions.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2026 BidPilot. Built for the Build with Gemini XPRIZE.
      </div>
    </footer>
  );
}
