import { requireUser } from "@/lib/require-user";
import PracticeClient from "./PracticeClient";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const user = await requireUser();
  return <PracticeClient isPremium={user.isPremium} />;
}
