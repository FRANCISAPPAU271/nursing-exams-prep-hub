import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { asc } from "drizzle-orm";
import LibraryClient from "./LibraryClient";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await requireUser();
  const rows = await db.select().from(lessons).orderBy(asc(lessons.sortOrder));
  return <LibraryClient lessons={rows} isPremium={user.isPremium} />;
}
