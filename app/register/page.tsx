import PageHeader from "@/components/PageHeader";
import { pageMeta } from "@/lib/seo";
import { getSettings, seatsTaken } from "@/lib/settings";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = pageMeta("/register", "Register");

export default async function Register() {
  const [s, taken] = await Promise.all([getSettings(), seatsTaken()]);
  const left = Object.fromEntries(Object.entries(taken).map(([k, v]) => [k, Math.max(0, s.seat_cap - v)]));
  return (
    <>
      <PageHeader path="/register" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap">
          <RegisterForm seatsLeft={left} seatCap={s.seat_cap} consents={s.consents} />
        </div>
      </main>
    </>
  );
}
