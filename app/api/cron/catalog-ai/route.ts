import { getGoogleEnv } from "@/lib/google/auth"
import { listImages } from "@/lib/google/drive"
import { readAiControlRows } from "@/lib/google/sheets"

export const runtime = "nodejs"
export const maxDuration = 300

const MAX_IMAGES_PER_RUN = 4

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return Response.json(
      { error: "CRON_SECRET no est? configurado." },
      { status: 503 },
    )
  }

  const authorization =
    request.headers.get("authorization")?.trim()

  if (authorization !== `Bearer ${cronSecret}`) {
    return Response.json(
      { error: "No autorizado." },
      { status: 401 },
    )
  }

  const env = getGoogleEnv()

  if (!env) {
    return Response.json(
      { error: "Google no est? configurado." },
      { status: 503 },
    )
  }

  try {
    const [files, controlRows] = await Promise.all([
      listImages(env, { fresh: true }),
      readAiControlRows(env),
    ])

    const latestNameByFileId = new Map<string, string>()

    for (const row of controlRows) {
      const fileId = row.fileId.trim()
      const fileName = row.fileName.trim()

      if (fileId) {
        latestNameByFileId.set(fileId, fileName)
      }
    }

    const pending = files.filter((file) => {
      if (!/^\d+/.test(file.name)) {
        return false
      }

      const lastProcessedName =
        latestNameByFileId.get(file.id)

      return lastProcessedName !== file.name
    })

    if (pending.length === 0) {
      return Response.json({
        status: "up-to-date",
        driveImages: files.length,
        pendingImages: 0,
        processedImages: 0,
        results: [],
      })
    }

    const selected =
      pending.slice(0, MAX_IMAGES_PER_RUN)

    const origin = new URL(request.url).origin
    const results: unknown[] = []

    for (const file of selected) {
      const response = await fetch(
        `${origin}/api/admin/catalog/ai-apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cronSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: file.id,
          }),
          cache: "no-store",
        },
      )

      const result = await response
        .json()
        .catch(() => ({
          error: "Respuesta inv?lida de ai-apply.",
        }))

      results.push({
        fileId: file.id,
        fileName: file.name,
        httpStatus: response.status,
        result,
      })

      if (!response.ok) {
        break
      }
    }

    return Response.json({
      status: "processed",
      driveImages: files.length,
      pendingImagesBeforeRun: pending.length,
      processedImages: results.length,
      remainingEstimate: Math.max(
        0,
        pending.length - results.length,
      ),
      results,
    })
  } catch (error) {
    console.error("[Catalog AI Cron]", error)

    return Response.json(
      {
        error: "Fall? la automatizaci?n del cat?logo.",
      },
      { status: 500 },
    )
  }
}
