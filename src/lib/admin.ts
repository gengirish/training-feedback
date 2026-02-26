import { getServerSession } from "next-auth";
import { isAdminEmail } from "./auth";

export async function isAdminRequest(): Promise<boolean> {
  const session = await getServerSession();
  return isAdminEmail(session?.user?.email);
}
