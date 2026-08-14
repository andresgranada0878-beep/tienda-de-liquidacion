import "server-only"

import { JWT } from "google-auth-library"

/**
 * Google Sheets: lectura y escritura.
 * Google Drive: solo lectura.
 *
 * Las credenciales nunca se exponen al navegador.
 */
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
]

export type GoogleEnv = {
  clientEmail: string
  privateKey: string
  spreadsheetId: string
  sheetRange: string
  imagesFolderId: string
  driveFolderId: string
}

export function getGoogleEnv(): GoogleEnv | null {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  if (!clientEmail || !rawKey || !spreadsheetId) return null

  return {
    clientEmail,
    privateKey: rawKey.replace(/\\n/g, "\n"),
    spreadsheetId,
    sheetRange:
      process.env.GOOGLE_SHEET_RANGE || "Catalogo!A2:I",
    imagesFolderId:
      process.env.GOOGLE_IMAGES_FOLDER_ID || "",
    driveFolderId:
      process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  }
}

export function isGoogleConfigured() {
  return getGoogleEnv() !== null
}

let cachedClient: JWT | null = null

export function getJwtClient(env: GoogleEnv) {
  if (!cachedClient) {
    cachedClient = new JWT({
      email: env.clientEmail,
      key: env.privateKey,
      scopes: GOOGLE_SCOPES,
    })
  }

  return cachedClient
}

export async function getAccessToken(env: GoogleEnv) {
  const client = getJwtClient(env)
  const token = await client.getAccessToken()

  if (!token?.token) {
    throw new Error(
      "No se pudo obtener el token de acceso de Google",
    )
  }

  return token.token
}
