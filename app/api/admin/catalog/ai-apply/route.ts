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
  appendAiControlRow,
  appendSheetRow,
  readSheetRows,
  updateSheetCell,
} from "@/lib/google/sheets"

export const runtime = "nodejs"

function cell(row: string[], index: number) {
  return (row[index] ?? "").toString().trim()
}

function parsePhotoIds(value: string) {
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export async function POST(request: Request) {
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
      { error: "Google no está configurado." },
      { status: 503 },
    )
  }

  try {
    const body = (await request.json()) as {
      fileId?: string
    }

    const fileId = body.fileId?.trim()

    if (!fileId) {
      return Response.json(
        { error: "Falta fileId." },
        { status: 400 },
      )
    }

    const [rows, files] = await Promise.all([
      readSheetRows(env),
      listImages(env, { fresh: true }),
    ])

    const targetFile = files.find(
      (file) => file.id === fileId,
    )

    if (!targetFile) {
      return Response.json(
        { error: "La imagen no existe en la carpeta autorizada." },
        { status: 404 },
      )
    }

    const reference =
      targetFile.name.match(/^(\d+)/)?.[1] ?? null

    if (!reference) {
      return Response.json(
        {
          status: "ignored",
          message:
            "El nombre de la imagen no comienza con un código.",
          catalogModified: false,
        },
        { status: 422 },
      )
    }

    const candidates: CatalogCandidate[] =
      rows.flatMap((row, index) => {
        if (cell(row, 0) !== reference) {
          return []
        }

        return [
          {
            rowNumber: index + 2,
            code: cell(row, 0),
            name: cell(row, 1),
            color: cell(row, 2),
            photoIds: cell(row, 8),
          },
        ]
      })

    const currentAssociations =
      rows.flatMap((row, index) => {
        const photoIds = parsePhotoIds(
          cell(row, 8),
        )

        if (!photoIds.includes(fileId)) {
          return []
        }

        return [
          {
            rowNumber: index + 2,
            reference: cell(row, 0),
            photoIds,
          },
        ]
      })

    const sameReferenceAssociations =
      currentAssociations.filter(
        (association) =>
          association.reference === reference,
      )

    const previousAssociations =
      currentAssociations.filter(
        (association) =>
          association.reference !== reference,
      )

    const removePreviousAssociations =
      async () => {
        const removedRows: number[] = []

        for (
          const association
          of previousAssociations
        ) {
          const remainingIds =
            association.photoIds.filter(
              (id) => id !== fileId,
            )

          await updateSheetCell(
            env,
            `I${association.rowNumber}`,
            remainingIds.join(","),
          )

          removedRows.push(
            association.rowNumber,
          )
        }

        return removedRows
      }

    // Ya esta correctamente asociada a esta
    // referencia y no aparece en otra.
    if (
      sameReferenceAssociations.length > 0 &&
      previousAssociations.length === 0
    ) {
      return Response.json({
        status: "already-associated",
        reference,
        rowNumber:
          sameReferenceAssociations[0].rowNumber,
        catalogModified: false,
      })
    }

    // Caso de recuperacion:
    // ya alcanzo a escribirse en la nueva
    // referencia pero todavia existe tambien
    // en una referencia anterior.
    if (
      sameReferenceAssociations.length > 0 &&
      previousAssociations.length > 0
    ) {
      const removedFromRows =
        await removePreviousAssociations()

      const targetAssociation =
        sameReferenceAssociations[0]

      const targetRow =
        rows[targetAssociation.rowNumber - 2]

      await appendAiControlRow(env, {
        fileId,
        fileName: targetFile.name,
        reference,
        color: cell(targetRow, 2),
        status: "REASIGNACION_LIMPIADA",
        processedAt: new Date().toISOString(),
      })

      return Response.json({
        status: "reassignment-cleaned",
        reference,
        rowNumber:
          targetAssociation.rowNumber,
        removedFromRows,
        catalogModified:
          removedFromRows.length > 0,
      })
    }

    if (candidates.length === 0) {
      // Referencia completamente nueva.
      // Primero creamos el borrador nuevo.
      // Solo despues retiramos asociaciones
      // pertenecientes a referencias anteriores.
      await appendSheetRow(env, [
        reference,
        "",
        "",
        "",
        0,
        "",
        "",
        "",
        fileId,
      ])

      const removedFromRows =
        await removePreviousAssociations()

      await appendAiControlRow(env, {
        fileId,
        fileName: targetFile.name,
        reference,
        color: "",
        status:
          removedFromRows.length > 0
            ? "BORRADOR_NUEVA_REFERENCIA_REASIGNADA"
            : "BORRADOR_NUEVA_REFERENCIA",
        processedAt: new Date().toISOString(),
      })

      return Response.json({
        status:
          removedFromRows.length > 0
            ? "draft-new-reference-reassigned"
            : "draft-new-reference",
        reference,
        removedFromRows,
        catalogModified: true,
        published: false,
      })
    }

    const downloaded = await downloadFile(
      env,
      fileId,
    )

    if (!downloaded) {
      return Response.json(
        { error: "No se pudo descargar la imagen." },
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
        candidates,
      })

    // No escribimos si Gemini no toma una decisión clara.
    if (
      ai.existingMatches.length === 0 &&
      ai.newColors.length === 0
    ) {
      await appendAiControlRow(env, {
        fileId,
        fileName: targetFile.name,
        reference,
        color: "",
        status: "REQUIERE_REVISION",
        processedAt: new Date().toISOString(),
      })

      return Response.json({
        status: "needs-review",
        ai,
        catalogModified: false,
      })
    }

    // Primera versión de seguridad:
    // exigimos confianza >= 90 para escritura automática.
    const existing = ai.existingMatches
      .filter((match) => match.confidence >= 90)
      .sort((a, b) => b.confidence - a.confidence)[0]

    if (existing) {
      const ids = parsePhotoIds(existing.photoIds)

      const newValue = [...new Set([...ids, fileId])]
        .join(",")

      await updateSheetCell(
        env,
        `I${existing.rowNumber}`,
        newValue,
      )

      const removedFromRows =
        await removePreviousAssociations()

      await appendAiControlRow(env, {
        fileId,
        fileName: targetFile.name,
        reference,
        color: existing.color,
        status:
          removedFromRows.length > 0
            ? "REASIGNADO_COLOR_EXISTENTE"
            : "ASOCIADO_COLOR_EXISTENTE",
        processedAt: new Date().toISOString(),
      })

      return Response.json({
        status:
          removedFromRows.length > 0
            ? "existing-color-reassigned"
            : "existing-color-updated",
        reference,
        color: existing.color,
        rowNumber: existing.rowNumber,
        confidence: existing.confidence,
        removedFromRows,
        catalogModified: true,
        published:
          false,
      })
    }

    const newColor = ai.newColors
      .filter((match) => match.confidence >= 90)
      .sort((a, b) => b.confidence - a.confidence)[0]

    if (newColor) {
      // Seguridad extra por si el nombre difiere solo
      // en mayúsculas/tildes.
      const equivalent = candidates.find(
        (candidate) =>
          normalize(candidate.color) ===
          normalize(newColor.color),
      )

      if (equivalent) {
        const ids = parsePhotoIds(
          equivalent.photoIds,
        )

        await updateSheetCell(
          env,
          `I${equivalent.rowNumber}`,
          [...new Set([...ids, fileId])].join(","),
        )

        const removedFromRows =
          await removePreviousAssociations()

        await appendAiControlRow(env, {
          fileId,
          fileName: targetFile.name,
          reference,
          color: equivalent.color,
          status:
            removedFromRows.length > 0
              ? "REASIGNADO_COLOR_EXISTENTE"
              : "ASOCIADO_COLOR_EXISTENTE",
          processedAt: new Date().toISOString(),
        })

        return Response.json({
          status:
            removedFromRows.length > 0
              ? "existing-color-reassigned"
              : "existing-color-updated",
          reference,
          color: equivalent.color,
          rowNumber: equivalent.rowNumber,
          removedFromRows,
          catalogModified: true,
        })
      }

      const template = candidates[0]

      // Nueva variante/borrador:
      // copiamos nombre y categoría de la referencia.
      // Stock = 0 y precio vacío para impedir publicación.
      const templateRow =
        rows[template.rowNumber - 2]

      await appendSheetRow(env, [
        reference,
        cell(templateRow, 1),
        newColor.color,
        "",
        0,
        "",
        "",
        cell(templateRow, 7),
        fileId,
      ])

      const removedFromRows =
        await removePreviousAssociations()

      await appendAiControlRow(env, {
        fileId,
        fileName: targetFile.name,
        reference,
        color: newColor.color,
        status:
          removedFromRows.length > 0
            ? "BORRADOR_COLOR_NUEVO_REASIGNADO"
            : "BORRADOR_COLOR_NUEVO",
        processedAt: new Date().toISOString(),
      })

      return Response.json({
        status:
          removedFromRows.length > 0
            ? "draft-new-color-reassigned"
            : "draft-new-color",
        reference,
        color: newColor.color,
        confidence: newColor.confidence,
        removedFromRows,
        catalogModified: true,
        published: false,
      })
    }

    await appendAiControlRow(env, {
      fileId,
      fileName: targetFile.name,
      reference,
      color: "",
      status: "REQUIERE_REVISION",
      processedAt: new Date().toISOString(),
    })

    return Response.json({
      status: "needs-review",
      ai,
      catalogModified: false,
    })
  } catch (error) {
    console.error("[Glamm AI Apply] Error:", error)

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
