import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Server-component guard. Next.js renders layouts and pages in parallel, so a
 * page cannot rely on the layout's redirect having run first — each page must
 * guard independently or it will throw on logged-out requests.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
