import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get("folder_id");
    const type = searchParams.get("type");

    let query = supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (folderId) {
      query = query.eq("folder_id", folderId);
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data: files, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: files });
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

    const { name, type, folder_id, content, file_path, size, mime_type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: "文件名和类型是必需的" }, { status: 400 });
    }

    // 验证文件夹存在性
    if (folder_id) {
      const { data: folder } = await supabase
        .from("folders")
        .select("id")
        .eq("id", folder_id)
        .eq("user_id", user.id)
        .single();

      if (!folder) {
        return NextResponse.json({ error: "文件夹不存在" }, { status: 400 });
      }
    }

    const { data: file, error } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        folder_id: folder_id || null,
        name,
        type,
        content: content || null,
        file_path: file_path || null,
        size: size || 0,
        mime_type: mime_type || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: file });
  } catch (error) {
    console.error("创建文件错误:", error);
    return NextResponse.json({ 
      error: "服务器错误", 
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 });
  }
}