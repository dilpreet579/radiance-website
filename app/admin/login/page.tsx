import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth";

async function login(form: FormData) {
  "use server";
  const { error } = await (await authClient()).auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error) redirect("/admin/login?e=1");
  redirect("/admin");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const input = "w-full rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-3 text-base text-fg outline-none focus:border-rust";
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-5">
      <form action={login} className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-cream p-8 text-fg">
        <h1 className="m-0 font-display text-3xl font-extrabold">Radiance admin</h1>
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password" required className={input} />
        {e && <span className="text-sm font-semibold text-err">Wrong email or password.</span>}
        <button className="btn btn-rust py-3.5 text-base">Sign in</button>
      </form>
    </main>
  );
}
