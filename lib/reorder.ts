import { db } from "./db";

// Move a row up/down within an ordered set by renumbering `position` 0..n-1.
// `scope` limits the set (e.g. {kind:'online'} for competitions).
export async function moveRow(table: string, id: string, dir: -1 | 1, scope: Record<string, string> = {}) {
  let q = db().from(table).select("id").order("position").order("id");
  for (const [k, v] of Object.entries(scope)) q = q.eq(k, v);
  const { data } = await q;
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id), j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((rid, pos) => db().from(table).update({ position: pos }).eq("id", rid)));
}

export async function nextPosition(table: string, scope: Record<string, string> = {}) {
  let q = db().from(table).select("position").order("position", { ascending: false }).limit(1);
  for (const [k, v] of Object.entries(scope)) q = q.eq(k, v);
  const { data } = await q;
  return (data?.[0]?.position ?? -1) + 1;
}
