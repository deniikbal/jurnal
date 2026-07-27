/**
 * Compress an image file on the client side before uploading.
 * Resizes to maxWidth/maxHeight and converts to JPEG at the given quality.
 */
export function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = options

  return new Promise((resolve, reject) => {
    // Skip non-image files
    if (!file.type.startsWith("image/")) {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Calculate new dimensions while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          // Build a new filename with .jpg extension
          const baseName = file.name.replace(/\.[^.]+$/, "")
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })

          resolve(compressed)
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Gagal memuat gambar untuk kompresi"))
    }

    img.src = url
  })
}
