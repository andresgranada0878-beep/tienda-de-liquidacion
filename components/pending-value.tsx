import { isPendiente } from "@/lib/site-config"

/**
 * Muestra un dato del negocio. Si todavía no está diligenciado en
 * lib/site-config.ts, se marca claramente como pendiente en lugar de inventarlo.
 */
export function PendingValue({ value }: { value: string }) {
  if (isPendiente(value)) {
    return (
      <span className="inline-block border border-dashed border-border px-1.5 py-0.5 text-xs text-muted-foreground">
        Pendiente por completar
      </span>
    )
  }
  return <span>{value}</span>
}
