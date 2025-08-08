import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/layout";

export default async function Admin() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  // 检查用户是否为管理员
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return <AdminLayout user={user} />;
}