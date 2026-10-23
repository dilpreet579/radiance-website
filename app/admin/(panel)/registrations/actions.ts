"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Returns the error instead of throwing: Next redacts thrown messages in production.
export async function deleteRegistration(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin("super");
  if (!id) return { ok: false, error: "Missing registration ID" };
  const { error } = await db().from("registrations").delete().eq("id", id);
  if (error) return { ok: false, error: "Delete failed: " + error.message };
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/leaderboard");
  return { ok: true };
}
