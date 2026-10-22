"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function saveLeader(id: string, patch: { engagement?: number | null; remarks?: string; selected?: boolean }) {
  await requireAdmin("super");
  const u: Record<string, unknown> = {};
  if ("engagement" in patch) u.engagement = patch.engagement;
  if ("remarks" in patch) u.remarks = patch.remarks;
  if ("selected" in patch) u.walk_selected = patch.selected;
  const { error } = await db().from("registrations").update(u).eq("id", id);
  if (error) throw new Error(error.message);
}
