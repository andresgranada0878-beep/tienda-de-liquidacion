import "server-only"

import { JWT } from "google-auth-library"

/**
 * Autenticación con cuenta de servicio de Google. SOLO LECTURA.
 * Nunca se expone al navegador: este módulo usa "server-only".
 */
const READONLY_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
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
    // En Vercel la llave se guarda con \n escapados.
    privateKey: rawKey.replace(/\\n/g, "\n"),
    spreadsheetId,
    sheetRange: process.env.GOOGLE_SHEET_RANGE || "Catalogo!A2:R",
    imagesFolderId: process.env.GOOGLE_IMAGES_FOLDER_ID || "",
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
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
      scopes: READONLY_SCOPES,
    })
  }
  return cachedClient
}

/** Token de acceso de solo lectura para llamar a las APIs REST de Google. */
export async function getAccessToken(env: GoogleEnv) {
  const client = getJwtClient(env)
  const token = await client.getAccessToken()
  if (!token?.token) throw new Error("No se pudo obtener el token de acceso de Google")
  return token.token
}
