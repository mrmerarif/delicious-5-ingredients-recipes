
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchAnotherRecipeProps {
  locale: string;
}

const translations = {
  en: {
    button: "Search Another Recipe",
    title: "What would you like to cook next?",
    description:
      "Search by recipe name or an ingredient you have available.",
    placeholder: "Try chicken, rice, potatoes...",
    search: "Search Recipes",
    close: "Close search",
    required: "Enter a recipe name or ingredient.",
  },
  es: {
    button: "Buscar otra receta",
    title: "¿Qué te gustaría cocinar ahora?",
    description:
      "Busca por nombre de receta o por un ingrediente que tengas.",
    placeholder: "Prueba pollo, arroz, papas...",
    search: "Buscar recetas",
    close: "Cerrar búsqueda",
    required: "Escribe una receta o un ingrediente.",
  },
  "pt-BR": {
    button: "Buscar outra receita",
    title: "O que você gostaria de cozinhar agora?",
    description:
      "Pesquise pelo nome da receita ou por um ingrediente disponível.",
    placeholder: "Experimente frango, arroz, batatas...",
    search: "Buscar receitas",
    close: "Fechar pesquisa",
    required: "Digite uma receita ou ingrediente.",
  },
} as const;

export default function SearchAnotherRecipe({
  locale,
}: SearchAnotherRecipeProps) {
  const router = useRouter();

  const language =
    locale === "es" || locale === "pt-BR"
      ? locale
      : "en";

  const t = translations[language];

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) {
      setError(t.required);
      inputRef.current?.focus();
      return;
    }

    setError("");

    const params = new URLSearchParams({
      q: searchTerm,
    });

    router.push(
      `/${language}/search?${params.toString()}`
    );
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          setError("");
        }}
        aria-expanded={isOpen}
        aria-controls="search-another-recipe-panel"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--fsm-accent)] px-4 py-2 text-center text-sm font-semibold text-[var(--fsm-accent)] transition-colors hover:bg-[var(--surface-muted)]"
      >
        <span aria-hidden="true">⌕</span>
        {t.button}
      </button>

      {isOpen && (
        <section
          id="search-another-recipe-panel"
          className="relative z-20 mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-lg sm:absolute sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2"
          aria-label={t.title}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {t.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {t.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.close}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-5 space-y-3"
          >
            <label
              htmlFor="search-another-recipe-input"
              className="sr-only"
            >
              {t.description}
            </label>

            <input
              ref={inputRef}
              id="search-another-recipe-input"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError("");
              }}
              placeholder={t.placeholder}
              maxLength={100}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--fsm-accent)]"
            />

            {error && (
              <p
                role="alert"
                className="text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--fsm-accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t.search}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
