
"use client";

import { useState } from "react";

interface IngredientPickerProps {
  options: string[];
  initial: string[];
  limit: number;
  label: string;
  prompt: string;
  noMatches: string;
  selectedValues?: string[];
  onSelectionChange?: (values: string[]) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

export default function IngredientPicker({
  options,
  initial,
  limit,
  label,
  prompt,
  noMatches,
  selectedValues,
  onSelectionChange,
  filterValue,
  onFilterChange,
}: IngredientPickerProps) {
  const [internalSelected, setInternalSelected] =
    useState(initial);

  const [internalFilter, setInternalFilter] =
    useState("");

  const selected =
    selectedValues ?? internalSelected;

  const filter =
    filterValue ?? internalFilter;

  const visible = [
    ...new Set([...options, ...selected]),
  ].filter((option) =>
    option
      .toLowerCase()
      .includes(filter.trim().toLowerCase())
  );

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : selected.length < limit
        ? [...selected, option]
        : selected;

    if (onSelectionChange) {
      onSelectionChange(next);
    } else {
      setInternalSelected(next);
    }
  }

  function updateFilter(value: string) {
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setInternalFilter(value);
    }
  }

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-semibold">
        {label} ({selected.length}/{limit})
      </legend>

      {selected.map((option) => (
        <input
          key={option}
          type="hidden"
          name="ingredients"
          value={option}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        {selected.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className="rounded-full bg-[var(--button-accent)] px-3 py-1 text-sm"
          >
            {option}{" "}
            <span aria-hidden="true">×</span>
            <span className="sr-only">
              {" "}({label} −)
            </span>
          </button>
        ))}
      </div>

      <input
        type="search"
        aria-label={prompt}
        placeholder={prompt}
        value={filter}
        maxLength={100}
        onChange={(event) =>
          updateFilter(event.target.value)
        }
        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-3"
      />

      <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-2">
        {visible.length === 0 && (
          <p className="p-2 text-sm">
            {noMatches}
          </p>
        )}

        {visible.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 rounded p-2 text-sm hover:bg-[var(--surface-muted)]"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              disabled={
                selected.length >= limit &&
                !selected.includes(option)
              }
              onChange={() => toggle(option)}
            />

            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
