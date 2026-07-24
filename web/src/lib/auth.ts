import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface SessionContext {
  user: User;
  organizationId: string | null;
  organizationName: string | null;
  isAdmin: boolean;
  /** Judge/demo orgs checkout free — never create arms-length revenue. */
  isDemoOrganization: boolean;
  isJudgeMember: boolean;
}

/** Load the current user and their primary organization; redirect to /login when unauthenticated. */
export async function requireSession(): Promise<SessionContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(legal_name, is_demo)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const org = membership?.organizations as unknown as {
    legal_name: string;
    is_demo: boolean;
  } | null;

  return {
    user,
    organizationId: membership?.organization_id ?? null,
    organizationName: org?.legal_name ?? null,
    isAdmin: (user.app_metadata?.role as string | undefined) === "admin",
    isDemoOrganization: Boolean(org?.is_demo),
    isJudgeMember: membership?.role === "judge",
  };
}

export async function requireOrganization(): Promise<SessionContext & { organizationId: string }> {
  const session = await requireSession();
  if (!session.organizationId) redirect("/onboarding");
  return session as SessionContext & { organizationId: string };
}

export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!session.isAdmin) redirect("/dashboard");
  return session;
}

/** Free checkout for XPRIZE judges / demo orgs even when Stripe is live. */
export function isComplimentaryCheckout(session: SessionContext): boolean {
  return session.isDemoOrganization || session.isJudgeMember;
}
