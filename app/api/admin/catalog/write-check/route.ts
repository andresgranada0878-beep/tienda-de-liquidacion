import { getAccessToken, getGoogleEnv } from "@/lib/google/auth"

export const runtime = "nodejs"

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

  try {
    const token = await getAccessToken(env)

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      return Response.json(
        { error: `Google tokeninfo respondió ${response.status}` },
        { status: 502 },
      )
    }

    const info = (await response.json()) as {
      scope?: string
    }

    const scopes = (info.scope ?? "")
      .split(/\s+/)
      .filter(Boolean)

    const sheetsWrite =
      scopes.includes(
        "https://www.googleapis.com/auth/spreadsheets",
      )

    const driveReadonly =
      scopes.includes(
        "https://www.googleapis.com/auth/drive.readonly",
      )

    return Response.json({
      status:
        sheetsWrite && driveReadonly
          ? "ready"
          : "missing-scope",
      sheetsWrite,
      driveReadonly,
      scopes,
      dataModified: false,
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
        dataModified: false,
      },
      { status: 500 },
    )
  }
}
