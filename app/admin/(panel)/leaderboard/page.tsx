import { requireAdmin } from "@/lib/auth";
import { leaderboard } from "@/lib/reports";
import Leaderboard from "./Leaderboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin("super");
  return <Leaderboard rows={await leaderboard()} />;
}
