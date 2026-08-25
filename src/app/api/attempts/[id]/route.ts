import { db } from "@/db";
import { attempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(attempts).where(and(eq(attempts.id, Number(id)), eq(attempts.userId, user.id)));
  return Response.json({ ok: true });
}
