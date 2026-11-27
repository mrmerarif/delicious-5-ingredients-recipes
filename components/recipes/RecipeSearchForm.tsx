
"use client";

import { useEffect, useState } from "react";
import Form from "next/form";
import Link from "next/link";

import IngredientPicker from "./IngredientPicker";

const STORAGE_KEY =
  "delicious-recipes:search-draft:v1";

interface SearchDraft {
  query: string;
  ingredients: string[];
  category: string;
  ingredientFilter: string;
}

interface StoredDraft {
  searchKey: string;
  draft: SearchDraft;
}

interface SearchFormText {
  name: string;
  ingredients: string;
  picker: string;
  noIngredients: string;
  category: string;
  all: string;
  submit: string;
  clear: string;
  filtersError: string;
}

interface RecipeSearchFormProps {
  path: string;
  query: string;
  selected: string[];
  category: string;
  options: string[];
  categoryOptions: string[];
  limit: number;
  searchKey: string;
  filtersFailed: boolean;
  filtered: boolean;
  text: SearchFormText;
}

const inputStyle =
  "w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-3";

function removeSavedDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Search remains usable without browser storage.
  }
}

export default function RecipeSearchForm({
  path,
  query,
  selected,
  category,
  options,
  categoryOptions,
  limit,
  searchKey,
  filtersFailed,
  filtered,
  text,
}: RecipeSearchFormProps) {
  const [draft, setDraft] = useState<SearchDraft>({
    query,
    ingredients: selected,
    category,
    ingredientFilter: "",
  });

  useEffect(() => {
    const initialDraft: SearchDraft = {
      query,
      ingredients: selected,
      category,
      ingredientFilter: "",
    };

    let restored = initialDraft;

    try {
      const saved =
        sessionStorage.getItem(STORAGE_KEY);

      if (saved) {
        const stored =
          JSON.parse(saved) as StoredDraft;

        const value = stored.draft;

        if (
          stored.searchKey === searchKey &&
          value &&
          typeof value.query === "string" &&
          typeof value.category === "string" &&
          typeof value.ingredientFilter === "string" &&
          Array.isArray(value.ingredients)
        ) {
          restored = {
            query: value.query.slice(0, 100),

            ingredients: [
              ...new Set(
                value.ingredients
                  .filter(
                    (item) =>
                      typeof item === "string"
                  )
                  .map((item) => item.slice(0, 100))
              ),
            ].slice(0, limit),

            category: value.category.slice(0, 60),

            ingredientFilter:
              value.ingredientFilter.slice(0, 100),
          };
        }
      }
    } catch {
      // Ignore invalid or unavailable saved drafts.
    }

    setDraft(restored);
  }, [
    query,
    selected,
    category,
    searchKey,
    limit,
  ]);

  function updateDraft(
    changes: Partial<SearchDraft>
  ) {
    const next = {
      ...draft,
      ...changes,
    };

    setDraft(next);

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          searchKey,
          draft: next,
        })
      );
    } catch {
      // Search remains usable without storage.
    }
  }

  function clearDraft() {
    removeSavedDraft();

    setDraft({
      query: "",
      ingredients: [],
      category: "",
      ingredientFilter: "",
    });
  }

  const hasDraft = Boolean(
    draft.query ||
    draft.ingredients.length ||
    draft.category ||
    draft.ingredientFilter
  );

  return (
    <Form
      action={path}
      role="search"
      onSubmit={removeSavedDraft}
      className="space-y-5 rounded-[var(--radius-large)] border border-[var(--border-color)] bg-[var(--surface-muted)] p-5"
    >
      <label className="block space-y-2 font-semibold">
        <span>{text.name}</span>

        <input
          type="search"
          name="q"
          value={draft.query}
          maxLength={100}
          className={inputStyle}
          onChange={(event) =>
            updateDraft({
              query: event.target.value,
            })
          }
        />
      </label>

      <IngredientPicker
        options={options}
        initial={selected}
        limit={limit}
        label={text.ingredients}
        prompt={text.picker}
        noMatches={text.noIngredients}
        selectedValues={draft.ingredients}
        onSelectionChange={(ingredients) =>
          updateDraft({ ingredients })
        }
        filterValue={draft.ingredientFilter}
        onFilterChange={(ingredientFilter) =>
          updateDraft({ ingredientFilter })
        }
      />

      <label className="block space-y-2 font-semibold">
        <span>{text.category}</span>

        <select
          name="category"
          value={draft.category}
          className={inputStyle}
          onChange={(event) =>
            updateDraft({
              category: event.target.value,
            })
          }
        >
          <option value="">
            {text.all}
          </option>

          {[
            ...new Set(
              [
                ...categoryOptions,
                category,
                draft.category,
              ].filter(Boolean)
            ),
          ].map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </label>

      {filtersFailed && (
        <p role="status" className="text-sm">
          {text.filtersError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          className="btn-primary"
          type="submit"
        >
          {text.submit}
        </button>

        {(filtered || hasDraft) && (
          <Link
            className="underline"
            href={path}
            onClick={clearDraft}
          >
            {text.clear}
          </Link>
        )}
      </div>
    </Form>
  );
}
