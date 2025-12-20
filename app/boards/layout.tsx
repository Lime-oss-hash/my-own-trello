import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
