import "server-only"

import { getAccessToken, type GoogleEnv } from "./auth"

export type DriveFile = {
  id: string
  name: string
  mimeType: string
}

/**
 * Lista las imágenes de la subcarpeta autorizada. SOLO LECTURA.
 * No existe ninguna función para crear, mover, editar o eliminar archivos.
 */
export async function listImages(
  env: GoogleEnv,
  options?: { fresh?: boolean },
): Promise<DriveFile[]> {
  const folderId = env.imagesFolderId
  if (!folderId) return []

  const token = await getAccessToken(env)
  const files: DriveFile[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType)",
      pageSize: "1000",
      orderBy: "name",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    })
    if (pageToken) params.set("pageToken", pageToken)

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        ...(options?.fresh
          ? {
              cache: "no-store" as const,
            }
          : {
              next: {
                revalidate: 300,
                tags: ["catalogo"],
              },
            }),
      },
    )

    if (!res.ok) throw new Error(`Drive API respondió ${res.status}`)

    const data = (await res.json()) as { files?: DriveFile[]; nextPageToken?: string }
    files.push(...(data.files ?? []))
    pageToken = data.nextPageToken
  } while (pageToken)

  return files
}

/** Verifica que el archivo pertenezca a la carpeta autorizada. */
export async function isFileInAuthorizedFolder(env: GoogleEnv, fileId: string) {
  const token = await getAccessToken(env)
  const params = new URLSearchParams({
    fields: "id, parents, mimeType",
    supportsAllDrives: "true",
  })
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } },
  )
  if (!res.ok) return null

  const data = (await res.json()) as { parents?: string[]; mimeType?: string }
  const allowed = [env.imagesFolderId, env.driveFolderId].filter(Boolean)
  const parents = data.parents ?? []
  if (!parents.some((p) => allowed.includes(p))) return null
  if (!data.mimeType?.startsWith("image/")) return null
  return { mimeType: data.mimeType }
}

/** Descarga el contenido binario de una imagen. SOLO LECTURA (alt=media). */
export async function downloadFile(env: GoogleEnv, fileId: string) {
  const token = await getAccessToken(env)
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  )
  if (!res.ok || !res.body) return null
  return res
}

