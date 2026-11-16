
import type { Locale } from "../../lib/i18n/config";

interface IngredientSearchProps {
  locale: Locale;
  placeholder: string;
  buttonLabel: string;
}

export default function IngredientSearch({
  locale,
  placeholder,
  buttonLabel,
}: IngredientSearchProps) {
  return (
    <form
      action={`/${locale}/recipes`}
      method="GET"
      role="search"
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <label
        htmlFor="home-ingredient-search"
        className="sr-only"
      >
        {placeholder}
      </label>

      <input
        id="home-ingredient-search"
        type="search"
        name="ingredients"
        placeholder={placeholder}
        required
        minLength={2}
        maxLength={200}
        autoComplete="off"
        className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--text-muted)]"
      />

      <button
        type="submit"
        className="btn-primary min-h-12 whitespace-nowrap"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
