"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function deleteRegistration(id: string): Promise<{ ok: boolean }> {
  await requireAdmin("super");
  if (!id) throw new Error("Missing registration ID");
  const { error } = await db().from("registrations").delete().eq("id", id);
  if (error) throw new Error("Delete failed: " + error.message);
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/leaderboard");
  return { ok: true };
}
