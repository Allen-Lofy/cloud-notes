import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: fileId } = await params;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    return NextResponse.json({ data: file });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: fileId } = await params;
    const updateData = await request.json();

    // 验证文件所有权
    const { data: existingFile } = await supabase
      .from("files")
      .select("id")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (!existingFile) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 如果更新文件夹，验证文件夹存在性
    if (updateData.folder_id) {
      const { data: folder } = await supabase
        .from("folders")
        .select("id")
        .eq("id", updateData.folder_id)
        .eq("user_id", user.id)
        .single();

      if (!folder) {
        return NextResponse.json({ error: "目标文件夹不存在" }, { status: 400 });
      }
    }

    const { data: file, error } = await supabase
      .from("files")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: file });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: fileId } = await params;

    // 获取文件信息以删除存储中的文件
    const { data: file } = await supabase
      .from("files")
      .select("file_path")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 删除数据库记录
    const { error: dbError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 如果有存储文件路径，删除存储中的文件
    if (file.file_path) {
      const { error: storageError } = await supabase.storage
        .from("user-files")
        .remove([file.file_path]);

      if (storageError) {
        console.error("删除存储文件失败:", storageError);
        // 不返回错误，因为数据库记录已经删除
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}