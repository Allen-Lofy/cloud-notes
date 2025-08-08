import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsLayout } from "@/components/settings/layout";

export default async function Settings() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/login");
  }

  return <SettingsLayout user={user} />;
}