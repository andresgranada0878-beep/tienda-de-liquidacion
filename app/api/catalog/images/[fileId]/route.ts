import { getGoogleEnv } from "@/lib/google/auth"
import { downloadFile, isFileInAuthorizedFolder } from "@/lib/google/drive"

/**
 * Sirve las imágenes privadas de Google Drive desde el servidor.
 * Solo lectura. Solo archivos que pertenecen a la carpeta autorizada.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params

  // Rechaza IDs con formato inválido antes de llamar a Google.
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(fileId)) {
    return new Response("ID inválido", { status: 400 })
  }

  const env = getGoogleEnv()
  if (!env) {
    return new Response("Catálogo no configurado", { status: 503 })
  }

  try {
    const meta = await isFileInAuthorizedFolder(env, fileId)
    if (!meta) {
      return new Response("No autorizado", { status: 403 })
    }

    const file = await downloadFile(env, fileId)
    if (!file?.body) {
      return new Response("No encontrado", { status: 404 })
    }

    return new Response(file.body, {
      headers: {
        "Content-Type": meta.mimeType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.log("[v0] Error sirviendo imagen del catálogo:", (error as Error).message)
    return new Response("Error al obtener la imagen", { status: 502 })
  }
}
