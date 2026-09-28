import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/eternitycrmadmin/login");

  return (
    <AdminShell admin={admin}>
      {children}
    </AdminShell>
  );
}
