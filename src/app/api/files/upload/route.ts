import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/data";
import { isDemoEmail } from "@/lib/demo-workspace";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const { organization, profile, role, supabase, userId } =
    await getCurrentContext();

  if (role === "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isDemoEmail(profile.email)) {
    return NextResponse.json(
      { error: "Demo workspace file uploads are disabled." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const storagePath = `${organization.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("client-files")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("files").insert({
    client_id: String(formData.get("clientId") || "") || null,
    mime_type: file.type || "application/octet-stream",
    name: String(formData.get("name") || file.name),
    organization_id: organization.id,
    project_id: String(formData.get("projectId") || "") || null,
    shared_with_client: formData.get("sharedWithClient") === "on",
    size_bytes: file.size,
    storage_path: storagePath,
    uploaded_by: userId,
  });

  if (insertError) {
    await supabase.storage.from("client-files").remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  await supabase.from("activity_logs").insert({
    action: "File Uploaded",
    actor_id: userId,
    entity_type: "file",
    metadata: { detail: `${file.name} was uploaded.` },
    organization_id: organization.id,
  });

  return NextResponse.json({ ok: true });
}
