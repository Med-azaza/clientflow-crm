import { type NextRequest, NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/data";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/files/[id]/download">,
) {
  const { id } = await context.params;
  const { organization, supabase } = await getCurrentContext();
  const { data: file, error } = await supabase
    .from("files")
    .select("storage_path")
    .eq("organization_id", organization.id)
    .eq("id", id)
    .single();

  if (error || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const { data, error: signedError } = await supabase.storage
    .from("client-files")
    .createSignedUrl(file.storage_path, 60);

  if (signedError || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Unable to create signed URL" },
      { status: 400 },
    );
  }

  return NextResponse.redirect(new URL(data.signedUrl, request.url));
}
