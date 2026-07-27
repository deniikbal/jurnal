import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/google-drive"

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return new NextResponse("Missing id parameter", { status: 400 })
  }

  try {
    const accessToken = await getAccessToken()

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      console.error(`Drive image proxy gagal (${res.status}): ${errorText}`)
      return new NextResponse(null, { status: 502 })
    }

    const contentType =
      res.headers.get("content-type") ?? "image/jpeg"

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("Drive image proxy error:", error)
    return new NextResponse(null, { status: 502 })
  }
}
