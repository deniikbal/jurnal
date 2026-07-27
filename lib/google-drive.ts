export async function getAccessToken(): Promise<string> {
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

  const permRes = await fetch(
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

  if (!permRes.ok) {
    const permError = await permRes.text().catch(() => "Unknown error")
    console.error(`Gagal mengatur permission public untuk file ${fileId}: ${permError}`)
  }

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/** Extract a Google Drive file ID from various URL formats */
function extractDriveFileId(url: string): string | null {
  // Already a thumbnail or uc URL with id param
  if (url.includes("drive.google.com/thumbnail") || url.includes("drive.google.com/uc")) {
    try {
      const id = new URL(url).searchParams.get("id")
      if (id) return id
    } catch { /* ignore invalid URLs */ }
  }

  // /file/d/FILE_ID/view...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileDMatch?.[1]) return fileDMatch[1]

  // uc?export=view&id=FILE_ID or open?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch?.[1]) return idMatch[1]

  // Raw Google Drive file ID (20+ alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url

  return null
}

/** Convert any Google Drive URL to a local proxy URL that works in <img> tags */
export function getDriveImageUrl(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const fileId = extractDriveFileId(trimmed)
  if (fileId) return `/api/drive-image?id=${fileId}`

  // Not a recognized Google Drive URL — return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed

  return null
}
