import {
  matchCatalogColorWithGemini,
  type CatalogCandidate,
} from "@/lib/ai/gemini"
import { getGoogleEnv } from "@/lib/google/auth"
import {
  downloadFile,
  listImages,
} from "@/lib/google/drive"
import {
  readAiControlRows,
  readSheetRows,
} from "@/lib/google/sheets"

export const runtime = "nodejs"

function cell(row: string[], index: number) {
  return (row[index] ?? "").toString().trim()
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      {
        error:
          "Ruta disponible únicamente en desarrollo local.",
      },
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

  try {
    const url = new URL(request.url)
    const requestedFileId =
      url.searchParams.get("fileId")?.trim()

    const [rows, files, controlRows] =
      await Promise.all([
        readSheetRows(env),
        listImages(env, { fresh: true }),
        readAiControlRows(env),
      ])

    const catalogRows: CatalogCandidate[] =
      rows.flatMap((row, index) => {
        const code = cell(row, 0)
        const name = cell(row, 1)

        if (!/^\d+$/.test(code)) return []
        if (!name) return []

        return [
          {
            rowNumber: index + 2,
            code,
            name,
            color: cell(row, 2),
            photoIds: cell(row, 8),
          },
        ]
      })

    /*
     * Puede haber varias entradas de un mismo FILE_ID
     * en IA_Control a lo largo del tiempo.
     *
     * La última entrada es la que representa el
     * último nombre procesado.
     */
    const latestControlByFileId = new Map<
      string,
      (typeof controlRows)[number]
    >()

    for (const control of controlRows) {
      if (!control.fileId) continue
      latestControlByFileId.set(
        control.fileId,
        control,
      )
    }

    /*
     * Una imagen está pendiente cuando:
     *
     * 1. Su nombre comienza por una referencia numérica.
     * 2. Nunca ha sido registrada en IA_Control,
     *    O fue renombrada desde su último procesamiento.
     */
    const pendingFiles = files.filter((file) => {
      if (!/^\d+/.test(file.name)) {
        return false
      }

      const previous =
        latestControlByFileId.get(file.id)

      if (!previous) {
        return true
      }

      return previous.fileName !== file.name
    })

    const targetFile = requestedFileId
      ? files.find(
          (file) => file.id === requestedFileId,
        )
      : pendingFiles[0]

    if (!targetFile) {
      return Response.json({
        status: "up-to-date",
        message:
          "No hay fotografías nuevas o renombradas pendientes.",
        controlSource: "IA_Control",
        driveImages: files.length,
        controlRecords: controlRows.length,
        pendingImages: 0,
        writePerformed: false,
      })
    }

    const detectedReference =
      targetFile.name.match(/^(\d+)/)?.[1] ?? null

    if (!detectedReference) {
      return Response.json(
        {
          status: "ignored",
          message:
            "La fotografía no tiene un código al inicio del nombre.",
          image: {
            id: targetFile.id,
            name: targetFile.name,
          },
          writePerformed: false,
        },
        { status: 422 },
      )
    }

    const referenceCandidates =
      catalogRows.filter(
        (candidate) =>
          candidate.code === detectedReference,
      )

    if (referenceCandidates.length === 0) {
      return Response.json({
        status: "new-reference",
        image: {
          id: targetFile.id,
          name: targetFile.name,
          mimeType: targetFile.mimeType,
          preview: `/api/catalog/images/${targetFile.id}`,
        },
        detectedReference,
        pendingImages: pendingFiles.length,
        decision: {
          source: "new-reference",
          message:
            "La referencia todavía no existe en el catálogo y deberá crearse como borrador.",
        },
        writePerformed: false,
      })
    }

    const uniqueColors = [
      ...new Set(
        referenceCandidates
          .map((candidate) =>
            candidate.color.trim(),
          )
          .filter(Boolean),
      ),
    ]

    const downloaded = await downloadFile(
      env,
      targetFile.id,
    )

    if (!downloaded) {
      return Response.json(
        {
          error:
            "No se pudo descargar la fotografía.",
        },
        { status: 502 },
      )
    }

    const bytes = new Uint8Array(
      await downloaded.arrayBuffer(),
    )

    const ai =
      await matchCatalogColorWithGemini({
        imageBytes: bytes,
        mimeType: targetFile.mimeType,
        candidates: referenceCandidates,
      })

    return Response.json({
      status:
        ai.existingMatches.length > 0
          ? "existing-color"
          : ai.newColors.length > 0
            ? "new-color"
            : "needs-review",
      controlSource: "IA_Control",
      image: {
        id: targetFile.id,
        name: targetFile.name,
        mimeType: targetFile.mimeType,
        preview: `/api/catalog/images/${targetFile.id}`,
      },
      detectedReference,
      availableColors: uniqueColors,
      pendingImages: pendingFiles.length,
      decision: {
        source: "gemini-color",
        ...ai,
      },
      writePerformed: false,
    })
  } catch (error) {
    console.error("[Glamm AI] Error:", error)

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

