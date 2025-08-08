import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权", details: authError }, { status: 401 });
    }

    // 测试数据库连接
    const { data: tables, error: tablesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (tablesError) {
      return NextResponse.json({ 
        error: "数据库连接失败", 
        details: tablesError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: user.id,
      message: "API 工作正常"
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "服务器错误", 
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 });
  }
}