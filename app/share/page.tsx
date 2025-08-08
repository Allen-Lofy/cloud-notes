import { createClient } from "@/lib/supabase/server";
import { ShareLayout } from "@/components/share/layout";

export default async function Share() {
  const supabase = await createClient();
  
  // 获取用户信息（可选，用于显示登录状态）
  const { data: { user } } = await supabase.auth.getUser();

  return <ShareLayout user={user} />;
}