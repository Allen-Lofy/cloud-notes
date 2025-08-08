import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    const { name, parent_id } = await request.json();
    const { id: folderId } = await params;

    // 验证文件夹所有权
    const { data: existingFolder } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("user_id", user.id)
      .single();

    if (!existingFolder) {
      return NextResponse.json({ error: "文件夹不存在" }, { status: 404 });
    }

    // 计算新路径
    let newPath = name || existingFolder.name;
    if (parent_id !== undefined) {
      if (parent_id) {
        const { data: parentFolder } = await supabase
          .from("folders")
          .select("path")
          .eq("id", parent_id)
          .eq("user_id", user.id)
          .single();

        if (parentFolder) {
          newPath = `${parentFolder.path}/${newPath}`;
        }
      }
      // 如果 parent_id 为 null，则是根文件夹
    } else if (existingFolder.parent_id) {
      // 保持原有的父文件夹关系
      const { data: parentFolder } = await supabase
        .from("folders")
        .select("path")
        .eq("id", existingFolder.parent_id)
        .single();

      if (parentFolder) {
        newPath = `${parentFolder.path}/${newPath}`;
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    updateData.path = newPath;

    const { data: folder, error } = await supabase
      .from("folders")
      .update(updateData)
      .eq("id", folderId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 更新子文件夹的路径
    if (newPath !== existingFolder.path) {
      await updateChildrenPaths(supabase, user.id, existingFolder.path, newPath);
    }

    return NextResponse.json({ data: folder });
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

    const { id: folderId } = await params;

    // 检查文件夹是否存在以及是否为空
    const { data: folder } = await supabase
      .from("folders")
      .select(`
        *,
        children:folders!parent_id(id),
        files(id)
      `)
      .eq("id", folderId)
      .eq("user_id", user.id)
      .single();

    if (!folder) {
      return NextResponse.json({ error: "文件夹不存在" }, { status: 404 });
    }

    if (folder.children?.length > 0 || folder.files?.length > 0) {
      return NextResponse.json({ error: "文件夹不为空，无法删除" }, { status: 400 });
    }

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

async function updateChildrenPaths(
  supabase: any,
  userId: string,
  oldPath: string,
  newPath: string
) {
  // 递归更新所有子文件夹的路径
  const { data: childFolders } = await supabase
    .from("folders")
    .select("id, path")
    .eq("user_id", userId)
    .like("path", `${oldPath}/%`);

  if (childFolders?.length > 0) {
    for (const child of childFolders) {
      const updatedPath = child.path.replace(oldPath, newPath);
      await supabase
        .from("folders")
        .update({ path: updatedPath })
        .eq("id", child.id);
    }
  }
}