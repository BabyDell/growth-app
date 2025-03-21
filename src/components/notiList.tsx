import { verifySession } from "@/lib/dal";

export async function NotificationList() {
  const session = await verifySession();
  console.log("This is Session:", session.userId);
  return <div>hi</div>;
}
