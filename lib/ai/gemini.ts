import "server-only"

export type CatalogCandidate = {
  rowNumber: number
  code: string
  name: string
  color: string
  photoIds: string
}

export type ExistingColorMatch = CatalogCandidate & {
  confidence: number
  reason: string
}

export type NewColorMatch = {
  color: string
  confidence: number
  reason: string
}

export type GeminiColorMatchResult = {
  model: string
  existingMatches: ExistingColorMatch[]
  newColors: NewColorMatch[]
  notes: string
}

function extractJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")

  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")

  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error("Gemini no devolvio JSON valido")
  }

  return JSON.parse(
    cleaned.slice(firstBrace, lastBrace + 1),
  )
}

export async function matchCatalogColorWithGemini(input: {
  imageBytes: Uint8Array
  mimeType: string
  candidates: CatalogCandidate[]
}): Promise<GeminiColorMatchResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no esta configurada")
  }

  if (input.candidates.length === 0) {
    throw new Error("No hay filas de la referencia para comparar")
  }

  const model =
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.5-flash-lite"

  const options = input.candidates.map((candidate) => ({
    rowNumber: candidate.rowNumber,
    code: candidate.code,
    name: candidate.name,
    color: candidate.color,
  }))

  const prompt = `
The product reference is already known with certainty from the image filename.

Your ONLY task is to determine the garment COLOR visible in the image.

The catalog rows below all belong to the SAME product reference.

IMPORTANT:
- First determine the actual color visible in the garment.
- Compare it with the existing catalog colors.
- If it corresponds to an existing color, return that exact catalog row.
- If the visible color is clearly different from every existing catalog color, report it as a NEW COLOR.
- Do not force a new color into an existing color.
- Ignore background, skin, jeans, accessories, shadows and lighting.
- Use a simple Spanish color name for a new color, for example:
  Blanco, Negro, Beige, Rosado, Rojo, Azul, Azul Celeste, Verde Militar, Vino Tinto.
- If the color cannot be determined reliably, return neither an existing match nor a new color.
- A photograph may contain more than one variant of the same reference. In that case multiple existing matches and/or new colors are allowed.

Return ONLY valid JSON using this exact structure:

{
  "existingMatches": [
    {
      "rowNumber": 83,
      "code": "57",
      "confidence": 97,
      "reason": "La prenda corresponde al color Verde Militar registrado."
    }
  ],
  "newColors": [
    {
      "color": "Blanco",
      "confidence": 96,
      "reason": "La prenda es blanca y ese color no existe entre las opciones registradas."
    }
  ],
  "notes": ""
}

Normally only one of existingMatches or newColors should contain results.

Confidence must be an integer from 0 to 100.

EXISTING CATALOG COLORS:
${JSON.stringify(options)}
`.trim()

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: input.mimeType,
              data: Buffer.from(
                input.imageBytes,
              ).toString("base64"),
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.05,
      maxOutputTokens: 800,
    },
  })

  const retryableStatuses = new Set([
    429,
    500,
    502,
    503,
    504,
  ])

  const maxAttempts = 3
  let response: Response | null = null

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: requestBody,
        cache: "no-store",
      })
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(
          `Gemini API no pudo conectarse despues de ${maxAttempts} intentos: ${
            error instanceof Error
              ? error.message
              : "error de red"
          }`,
        )
      }

      const delayMs =
        attempt === 1 ? 2000 : 5000

      console.warn(
        `[Gemini] Error de red. Reintento ${attempt + 1}/${maxAttempts} en ${delayMs} ms.`,
      )

      await new Promise((resolve) =>
        setTimeout(resolve, delayMs),
      )

      continue
    }

    if (response.ok) {
      break
    }

    const detail = await response.text()
    const retryable =
      retryableStatuses.has(response.status)

    if (
      !retryable ||
      attempt === maxAttempts
    ) {
      throw new Error(
        `Gemini API respondio ${response.status}: ${detail.slice(0, 500)}`,
      )
    }

    const delayMs =
      attempt === 1 ? 2000 : 5000

    console.warn(
      `[Gemini] HTTP ${response.status}. Reintento ${attempt + 1}/${maxAttempts} en ${delayMs} ms.`,
    )

    await new Promise((resolve) =>
      setTimeout(resolve, delayMs),
    )

    response = null
  }

  if (!response || !response.ok) {
    throw new Error(
      "Gemini API no devolvio una respuesta valida",
    )
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const responseText =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""

  if (!responseText) {
    throw new Error("Gemini no devolvio respuesta")
  }

  const parsed = extractJson(responseText) as {
    existingMatches?: Array<{
      rowNumber?: unknown
      code?: unknown
      confidence?: unknown
      reason?: unknown
    }>
    newColors?: Array<{
      color?: unknown
      confidence?: unknown
      reason?: unknown
    }>
    notes?: unknown
  }

  const byRow = new Map(
    input.candidates.map((candidate) => [
      candidate.rowNumber,
      candidate,
    ]),
  )

  const existingMatches: ExistingColorMatch[] = []

  for (const raw of parsed.existingMatches ?? []) {
    const rowNumber = Number(raw.rowNumber)
    const candidate = byRow.get(rowNumber)

    if (!candidate) continue

    if (
      typeof raw.code === "string" &&
      raw.code.trim() !== candidate.code
    ) {
      continue
    }

    const confidenceNumber = Number(raw.confidence)

    existingMatches.push({
      ...candidate,
      confidence: Number.isFinite(confidenceNumber)
        ? Math.max(0, Math.min(100, Math.round(confidenceNumber)))
        : 0,
      reason:
        typeof raw.reason === "string"
          ? raw.reason.trim()
          : "",
    })
  }

  const existingColorsNormalized = new Set(
    input.candidates.map((candidate) =>
      candidate.color
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase(),
    ),
  )

  const newColors: NewColorMatch[] = []

  for (const raw of parsed.newColors ?? []) {
    if (typeof raw.color !== "string") continue

    const color = raw.color.trim()

    if (!color) continue

    const normalized = color
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

    // Seguridad adicional:
    // Gemini no puede declarar "nuevo" un color
    // que ya existe en esta referencia.
    if (existingColorsNormalized.has(normalized)) {
      continue
    }

    const confidenceNumber = Number(raw.confidence)

    newColors.push({
      color,
      confidence: Number.isFinite(confidenceNumber)
        ? Math.max(0, Math.min(100, Math.round(confidenceNumber)))
        : 0,
      reason:
        typeof raw.reason === "string"
          ? raw.reason.trim()
          : "",
    })
  }

  return {
    model,
    existingMatches,
    newColors,
    notes:
      typeof parsed.notes === "string"
        ? parsed.notes.trim()
        : "",
  }
}

