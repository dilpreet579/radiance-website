import { leaderboard } from "@/lib/reports";
import { PageTitle, btnP, btnS } from "@/components/admin/ui";
import Leaderboard from "./Leaderboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <PageTitle title="Photo walk leaderboard" sub="NIT Delhi students ranked by attendance across 5 sessions, ties by engagement. Select up to 90 manually."
        actions={<>
          <a href="/admin/export?type=leaderboard" className={btnS}>Export table CSV</a>
          <a href="/admin/export?type=shortlist" className={btnP}>Export shortlist CSV</a>
        </>} />
      <Leaderboard rows={await leaderboard()} />
    </>
  );
}
