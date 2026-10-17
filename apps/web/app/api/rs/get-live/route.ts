import { getProjectBySlug } from "@/lib/server/data";
import { handle, ok } from "@/lib/server/http";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Get slug from query params
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if(!slug) {
    throw new Error("Missing slug query parameter");
  }
  return handle(async () => ok(await getProjectBySlug(slug)));
}