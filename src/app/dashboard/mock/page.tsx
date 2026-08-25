import { requireUser } from "@/lib/require-user";
import MockClient from "./MockClient";

export const dynamic = "force-dynamic";

export default async function MockPage() {
  const user = await requireUser();
  return <MockClient isPremium={user.isPremium} />;
}
