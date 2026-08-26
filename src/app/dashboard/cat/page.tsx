import { requireUser } from "@/lib/require-user";
import CatClient from "./CatClient";

export const dynamic = "force-dynamic";

export default async function CatPage() {
  const user = await requireUser();
  return <CatClient isPremium={user.isPremium} />;
}
