
import type { Locale } from "../../lib/i18n/config";

interface AdvertisementPlaceholderProps {
  locale: Locale;
  className?: string;
}

const translations = {
  en: {
    label: "Advertisement",
    description: "Reserved advertising space",
  },
  es: {
    label: "Publicidad",
    description: "Espacio reservado para publicidad",
  },
  "pt-BR": {
    label: "Publicidade",
    description: "Espaço reservado para publicidade",
  },
};

export default function AdvertisementPlaceholder({
  locale,
  className = "",
}: AdvertisementPlaceholderProps) {
  const text = translations[locale];

  return (
    <aside
      aria-label={text.label}
      className={`rounded-[var(--radius-large)] border border-dashed border-[var(--border-color)] bg-[var(--surface-muted)] p-5 ${className}`}
    >
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {text.label}
        </span>

        <p className="text-sm text-[var(--text-muted)]">
          {text.description}
        </p>
      </div>
    </aside>
  );
}
