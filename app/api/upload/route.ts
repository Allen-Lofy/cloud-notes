import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folder_id") as string;

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // 文件大小限制 (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "文件大小超过限制 (50MB)" }, { status: 400 });
    }

    // 文件类型检测
    const allowedTypes = [
      "application/pdf",
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/zip",
      "text/plain",
      "text/markdown"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
    }

    // 生成文件路径
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 确定文件类型
    let fileType = "other";
    if (file.type.startsWith("image/")) {
      fileType = "image";
    } else if (file.type === "application/pdf") {
      fileType = "pdf";
    } else if (
      file.type.includes("word") || 
      file.type.includes("document")
    ) {
      fileType = "document";
    } else if (file.type.includes("text") || file.type.includes("markdown")) {
      fileType = "markdown";
    }

    // 保存文件信息到数据库
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        folder_id: folderId || null,
        name: file.name,
        type: fileType,
        file_path: uploadData.path,
        size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      // 如果数据库插入失败，删除已上传的文件
      await supabase.storage.from("user-files").remove([uploadData.path]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: fileRecord,
      success: true 
    });

  } catch (error) {
    console.error("上传文件错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 批量上传
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderId = formData.get("folder_id") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // 文件大小检查
        if (file.size > 50 * 1024 * 1024) {
          errors.push(`${file.name}: 文件大小超过限制`);
          continue;
        }

        // 生成文件路径
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // 上传文件
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("user-files")
          .upload(fileName, file);

        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // 确定文件类型
        let fileType = "other";
        if (file.type.startsWith("image/")) {
          fileType = "image";
        } else if (file.type === "application/pdf") {
          fileType = "pdf";
        } else if (file.type.includes("word") || file.type.includes("document")) {
          fileType = "document";
        }

        // 保存到数据库
        const { data: fileRecord, error: dbError } = await supabase
          .from("files")
          .insert({
            user_id: user.id,
            folder_id: folderId || null,
            name: file.name,
            type: fileType,
            file_path: uploadData.path,
            size: file.size,
            mime_type: file.type,
          })
          .select()
          .single();

        if (dbError) {
          await supabase.storage.from("user-files").remove([uploadData.path]);
          errors.push(`${file.name}: 数据库错误`);
          continue;
        }

        results.push(fileRecord);

      } catch (error) {
        errors.push(`${file.name}: 处理失败`);
      }
    }

    return NextResponse.json({
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      success: true
    });

  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}