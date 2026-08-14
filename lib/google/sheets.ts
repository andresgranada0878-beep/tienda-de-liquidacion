import "server-only"

import {
  getAccessToken,
  type GoogleEnv,
} from "./auth"

function getSheetName(env: GoogleEnv) {
  const bang = env.sheetRange.indexOf("!")

  return bang >= 0
    ? env.sheetRange.slice(0, bang)
    : "Catalogo"
}

export async function readSheetRows(
  env: GoogleEnv,
): Promise<string[][]> {
  const token = await getAccessToken(env)

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(env.sheetRange)}` +
    `?majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      revalidate: 300,
      tags: ["catalogo"],
    },
  })

  if (!res.ok) {
    throw new Error(
      `Sheets API respondio ${res.status}`,
    )
  }

  const data = (await res.json()) as {
    values?: unknown[][]
  }

  return (data.values ?? []).map((row) =>
    row.map((value) =>
      value == null ? "" : String(value),
    ),
  )
}

export async function updateSheetCell(
  env: GoogleEnv,
  cellA1: string,
  value: string | number,
) {
  const token = await getAccessToken(env)
  const sheetName = getSheetName(env)

  const range = `${sheetName}!${cellA1}`

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}` +
    `?valueInputOption=USER_ENTERED`

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values: [[value]],
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text()

    throw new Error(
      `Sheets update respondio ${res.status}: ${detail.slice(0, 500)}`,
    )
  }

  return res.json()
}

export async function appendSheetRow(
  env: GoogleEnv,
  values: Array<string | number>,
) {
  if (values.length !== 9) {
    throw new Error(
      "Una fila del catalogo debe contener exactamente 9 columnas A:I",
    )
  }

  const token = await getAccessToken(env)
  const sheetName = getSheetName(env)

  const range = `${sheetName}!A:I`

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values: [values],
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text()

    throw new Error(
      `Sheets append respondio ${res.status}: ${detail.slice(0, 500)}`,
    )
  }

  return res.json()
}


export async function ensureAiControlSheet(
  env: GoogleEnv,
) {
  const token = await getAccessToken(env)

  const metadataUrl =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}?fields=sheets.properties`

  const metadataRes = await fetch(metadataUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!metadataRes.ok) {
    throw new Error(
      `No se pudo consultar la estructura del Sheet: ${metadataRes.status}`,
    )
  }

  const metadata = (await metadataRes.json()) as {
    sheets?: Array<{
      properties?: {
        title?: string
      }
    }>
  }

  const exists = metadata.sheets?.some(
    (sheet) =>
      sheet.properties?.title === "IA_Control",
  )

  if (!exists) {
    const createRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: "IA_Control",
                },
              },
            },
          ],
        }),
        cache: "no-store",
      },
    )

    if (!createRes.ok) {
      const detail = await createRes.text()

      throw new Error(
        `No se pudo crear IA_Control: ${createRes.status} ${detail.slice(0, 300)}`,
      )
    }
  }

  return {
    created: !exists,
  }
}

export async function writeAiControlRows(
  env: GoogleEnv,
  rows: Array<Array<string | number>>,
) {
  const token = await getAccessToken(env)

  const range = "IA_Control!A:F"

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values: rows,
      }),
      cache: "no-store",
    },
  )

  if (!res.ok) {
    const detail = await res.text()

    throw new Error(
      `No se pudo escribir IA_Control: ${res.status} ${detail.slice(0, 300)}`,
    )
  }

  return res.json()
}


export type AiControlRow = {
  fileId: string
  fileName: string
  reference: string
  color: string
  status: string
  processedAt: string
}

export async function readAiControlRows(
  env: GoogleEnv,
): Promise<AiControlRow[]> {
  const token = await getAccessToken(env)

  const range = "IA_Control!A2:F"

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(
      `No se pudo leer IA_Control: ${res.status}`,
    )
  }

  const data = (await res.json()) as {
    values?: unknown[][]
  }

  return (data.values ?? []).map((row) => ({
    fileId: String(row[0] ?? "").trim(),
    fileName: String(row[1] ?? "").trim(),
    reference: String(row[2] ?? "").trim(),
    color: String(row[3] ?? "").trim(),
    status: String(row[4] ?? "").trim(),
    processedAt: String(row[5] ?? "").trim(),
  }))
}

export async function appendAiControlRow(
  env: GoogleEnv,
  row: AiControlRow,
) {
  const token = await getAccessToken(env)

  const range = "IA_Control!A:F"

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.spreadsheetId)}` +
    `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values: [[
        row.fileId,
        row.fileName,
        row.reference,
        row.color,
        row.status,
        row.processedAt,
      ]],
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text()

    throw new Error(
      `No se pudo registrar IA_Control: ${res.status} ${detail.slice(0, 300)}`,
    )
  }

  return res.json()
}
