import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { Folder } from "@/lib/types";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { data: folders, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("path");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: folders });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, parent_id } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "文件夹名称是必需的" }, { status: 400 });
    }

    // 计算路径
    let path = name;
    if (parent_id) {
      const { data: parentFolder } = await supabase
        .from("folders")
        .select("path")
        .eq("id", parent_id)
        .eq("user_id", user.id)
        .single();

      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
      }
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        user_id: user.id,
        parent_id: parent_id || null,
        name,
        path,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: folder });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}