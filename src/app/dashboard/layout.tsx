import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import ContentGuard from "./ContentGuard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="protected-content min-h-screen lg:flex">
      <Sidebar
        user={{
          name: user.name,
          email: user.email,
          plan: user.plan,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <main className="min-w-0 flex-1 bg-slate-50 px-4 py-6 sm:px-8">{children}</main>
      <ContentGuard email={user.email} name={user.name} />
    </div>
  );
}
