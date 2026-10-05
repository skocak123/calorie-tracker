"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/Input";
import { formatNumber } from "@/lib/format";
import type { Food } from "@/lib/foods";

export type FoodOption = Pick<
  Food,
  "id" | "name" | "brand" | "kcal" | "protein" | "carbs" | "fat" | "fiber"
>;

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function FoodPicker({ onSelect }: { onSelect: (food: FoodOption) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodOption[]>([]);
  const [searchedFor, setSearchedFor] = useState("");

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;
  const isSearching = canSearch && searchedFor !== trimmed;

  // Search 300 ms after the user stops typing; cancel outdated requests.
  useEffect(() => {
    if (!canSearch) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/foods/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const body = await response.json();
        setResults(body.foods ?? []);
        setSearchedFor(trimmed);
      } catch {
        // Aborted because the user kept typing.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, canSearch]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Zoek een product, bijvoorbeeld kwark"
        aria-label="Zoek een product"
        autoFocus
      />

      {isSearching && <p className="text-sm text-zinc-500">Zoeken...</p>}

      {canSearch && !isSearching && results.length === 0 && (
        <p className="text-sm text-zinc-500">
          Niets gevonden.{" "}
          <Link href="/foods/new" className="text-emerald-700 hover:underline dark:text-emerald-400">
            Product toevoegen
          </Link>
        </p>
      )}

      {canSearch && results.length > 0 && (
        <ul className="max-h-64 divide-y divide-zinc-200 overflow-y-auto rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <span>
                  {food.name}
                  {food.brand && <span className="text-zinc-500"> · {food.brand}</span>}
                </span>
                <span className="shrink-0 text-zinc-500">{formatNumber(food.kcal)} kcal / 100 g</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
