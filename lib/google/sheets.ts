import "server-only"

import { getAccessToken, type GoogleEnv } from "./auth"

/**
 * Lee las filas del Google Sheets. SOLO LECTURA: se usa únicamente el método
 * values.get de la API de Sheets, nunca update/append/clear.
 */
export async function readSheetRows(env: GoogleEnv): Promise<string[][]> {
  const token = await getAccessToken(env)
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(env.sheetRange)}?majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // Revalidación periódica sin necesidad de volver a desplegar.
    next: { revalidate: 300, tags: ["catalogo"] },
  })

  if (!res.ok) {
    throw new Error(`Sheets API respondió ${res.status}`)
  }

  const data = (await res.json()) as { values?: unknown[][] }
  return (data.values ?? []).map((row) => row.map((cell) => (cell == null ? "" : String(cell))))
}
