async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_DRIVE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    throw new Error(`Gagal mendapatkan access token Google: ${res.status}`)
  }
  const data = await res.json()
  if (!data.access_token) {
    throw new Error("Access token Google tidak tersedia")
  }
  return data.access_token
}

export async function uploadToGoogleDrive(
  file: File,
  fileName: string,
): Promise<string> {
  const accessToken = await getAccessToken()
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  })

  const arrayBuffer = await file.arrayBuffer()
  const fileBase64 = Buffer.from(arrayBuffer).toString("base64")

  const boundary = `boundary_${Date.now()}`
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const multipartBody =
    delimiter +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    metadata +
    delimiter +
    `Content-Type: ${file.type}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    fileBase64 +
    closeDelimiter

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    },
  )

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => "Unknown error")
    throw new Error(`Google Drive upload gagal (${uploadRes.status}): ${errorText}`)
  }

  const uploadData = await uploadRes.json()
  const fileId: string = uploadData.id

  if (!fileId) {
    throw new Error("Google Drive tidak mengembalikan file ID")
  }

  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  )

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
}

/** Convert any Google Drive URL to a thumbnail embed URL that works in <img> tags */
export function getDriveImageUrl(url: string | null): string | null {
  if (!url) return null
  // Already a thumbnail URL
  if (url.includes("drive.google.com/thumbnail")) return url
  // Extract file ID from uc?export=view or other formats
  const match = url.match(/[?&]id=([^&]+)/)
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
  // Fallback: return as-is
  return url
}
