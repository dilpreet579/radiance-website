import { redirect } from "next/navigation";
import { authClient, requireAdmin } from "@/lib/auth";
import Shell from "@/components/admin/Shell";

async function signOut() {
  "use server";
  await (await authClient()).auth.signOut();
  redirect("/admin/login");
}

// Everything in this group is super-admin only; scanners are sent to /admin/scan.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("super");
  return <Shell signOut={signOut}>{children}</Shell>;
}
