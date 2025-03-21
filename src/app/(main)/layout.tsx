import type React from "react";
import Navbar from "@/components/NavBar";
import { getUserProfile } from "@/lib/user-service";
import { getNotificationCount } from "@/lib/notification-service";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserProfile();
  const notificationCount = user ? await getNotificationCount(user.id) : 0;
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={user} notificationCount={notificationCount} />

      <div className="flex-1">{children}</div>
    </div>
  );
}
