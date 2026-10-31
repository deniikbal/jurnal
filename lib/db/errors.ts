/**
 * Deteksi error database yang layak dicoba ulang.
 *
 * Drizzle membungkus error driver menjadi DrizzleQueryError dengan pesan
 * generik "Failed query: ...", jadi penyebab sebenarnya ada di `cause`.
 * Menelusuri rantai cause penting: tanpa itu, error jaringan Neon yang
 * sebenarnya sementara akan lolos tanpa retry dan tampil sebagai 500.
 */
const TRANSIENT_DB_ERROR =
  /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|UND_ERR_SOCKET|terminated|fetch failed|socket hang up|timeout|network/i

export function isTransientDbError(error: unknown) {
  let current: unknown = error

  for (let depth = 0; current && depth < 6; depth++) {
    const err = current as { message?: string; code?: string; cause?: unknown }
    if (TRANSIENT_DB_ERROR.test(`${err.code ?? ""} ${err.message ?? ""}`)) {
      return true
    }
    current = err.cause
  }

  return false
}
