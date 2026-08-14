import { getGoogleEnv } from "@/lib/google/auth"
import { listImages } from "@/lib/google/drive"

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      { error: "Solo disponible en desarrollo local." },
      { status: 404 },
    )
  }

  const env = getGoogleEnv()

  if (!env) {
    return Response.json(
      { error: "Google no está configurado." },
      { status: 503 },
    )
  }

  const files = await listImages(env)

  return Response.json({
    createdAt: new Date().toISOString(),
    imageCount: files.length,
    files: files
      .map((file) => ({
        id: file.id,
        name: file.name,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  })
}
