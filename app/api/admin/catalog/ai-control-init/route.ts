import { readFile } from "node:fs/promises"
import path from "node:path"

import { getGoogleEnv } from "@/lib/google/auth"
import {
  ensureAiControlSheet,
  writeAiControlRows,
} from "@/lib/google/sheets"

export const runtime = "nodejs"

type Baseline = {
  createdAt?: string
  imageCount?: number
  files?: Array<{
    id: string
    name: string
  }>
}

export async function POST() {
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

  try {
    const baselinePath = path.join(
      process.cwd(),
      "data",
      "catalog-ai-baseline.json",
    )

    const raw = (
      await readFile(baselinePath, "utf8")
    ).replace(/^\uFEFF/, "")

    const baseline = JSON.parse(raw) as Baseline

    const processDate =
      baseline.createdAt || new Date().toISOString()

    const rows: Array<Array<string | number>> = [
      [
        "FILE_ID",
        "NOMBRE_ARCHIVO",
        "REFERENCIA",
        "COLOR",
        "ESTADO",
        "FECHA_PROCESO",
      ],
    ]

    for (const file of baseline.files ?? []) {
      const reference =
        file.name.match(/^(\d+)/)?.[1] ?? ""

      rows.push([
        file.id,
        file.name,
        reference,
        "",
        "BASELINE",
        processDate,
      ])
    }

    const sheet = await ensureAiControlSheet(env)

    await writeAiControlRows(env, rows)

    return Response.json({
      status: "baseline-saved",
      sheet: "IA_Control",
      sheetCreated: sheet.created,
      baselineImages: rows.length - 1,
      catalogModified: false,
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
        catalogModified: false,
      },
      { status: 500 },
    )
  }
}
