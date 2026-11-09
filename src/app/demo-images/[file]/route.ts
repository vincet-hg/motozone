import { cookies } from "next/headers";
import { isDemo, isDemoAdmin } from "@/lib/demo";
import { readDemoImage, saveDemoImage } from "@/lib/demo-data";

type Context = { params: Promise<{ file: string }> };

export async function GET(_request: Request, { params }: Context) {
  const image = isDemo ? readDemoImage((await params).file) : null;
  if (!image) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(image.body), {
    headers: { "Content-Type": image.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

export async function PUT(request: Request, { params }: Context) {
  if (!isDemo) return new Response(null, { status: 404 });
  if (!isDemoAdmin(await cookies())) return new Response(null, { status: 401 });
  const body = Buffer.from(await request.arrayBuffer());
  return new Response(null, { status: saveDemoImage((await params).file, request.headers.get("content-type"), body) });
}
