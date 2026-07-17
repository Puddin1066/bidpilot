import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Create your account</h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        You&apos;ll set up your company profile next.
      </p>
      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
