import Link from "next/link";
import { redirect } from "next/navigation";
import { authClient, getAdmin } from "@/lib/auth";

async function login(form: FormData) {
  "use server";
  const { error } = await (await authClient()).auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error) redirect("/admin/login?e=1");
  const a = await getAdmin();
  if (!a) redirect("/admin/login?e=2"); // valid auth user but not in the admins table
  redirect(a.role === "super" ? "/admin" : "/admin/scan");
}

const label = "font-mono text-xs uppercase tracking-[.12em] text-fg-3";
const input = "w-full rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-[13px] text-base text-fg outline-none focus:border-rust";

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="pattern-bg grid min-h-screen place-items-center p-6 text-cream">
      <div className="flex w-[min(440px,100%)] flex-col gap-[22px]">
        <div className="rounded-md bg-cream px-3.5 py-2.5 shadow-[8px_8px_0_#1E0407]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/radiance26-logo.png" alt="Radiance 2026" className="block w-full" />
        </div>
        <form action={login} className="flex flex-col gap-[18px] rounded-[10px] bg-cream p-[clamp(22px,4vw,32px)] text-fg">
          <div className="font-display text-[30px] font-extrabold leading-none">Admin sign in</div>
          <div className="flex flex-col gap-1.5"><label className={label}>Email</label><input name="email" type="email" required className={input} /></div>
          <div className="flex flex-col gap-1.5"><label className={label}>Password</label><input name="password" type="password" required className={input} /></div>
          {e === "1" && <span className="text-sm font-semibold text-err">Wrong email or password.</span>}
          {e === "2" && <span className="text-sm font-semibold text-err">This account is not an admin.</span>}
          <button className="btn btn-rust cursor-pointer px-7 py-[15px] text-[17px]">Sign in</button>
          <div className="text-sm text-fg-3">Super admin: dashboard, tables, CSV export, shortlist and settings (laptop). Scanner admin: scan QR codes at the venue (phone).</div>
        </form>
        <Link href="/" className="text-center text-[15px] font-semibold !text-gold hover:!text-cream">← Back to the public site</Link>
      </div>
    </main>
  );
}
