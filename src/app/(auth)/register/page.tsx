import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
