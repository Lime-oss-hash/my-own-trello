import { PlanProvider } from "@/lib/contexts/PlanContext";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, has } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  const hasProPlan = has({ plan: "pro_user" });
  const hasEnterprisePlan = has({ plan: "enterprise_user" });

  return (
    <PlanProvider hasProPlan={hasProPlan} hasEnterprisePlan={hasEnterprisePlan}>
      {children}
    </PlanProvider>
  );
}
