import { Info } from "lucide-react"

/**
 * Aviso visible mientras el catálogo usa los datos de demostración.
 * Desaparece automáticamente al configurar las credenciales de Google.
 */
export function DemoNotice({ isDemo }: { isDemo: boolean }) {
  if (!isDemo) return null

  return (
    <div className="border-b border-dashed bg-secondary">
      <p className="mx-auto flex w-full max-w-7xl items-start gap-2 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground md:px-6">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span className="text-pretty">
          Modo de prueba: estás viendo productos de demostración con imágenes placeholder. Configura
          las variables de Google en Vercel para cargar el catálogo real desde el Google Sheets.
        </span>
      </p>
    </div>
  )
}
