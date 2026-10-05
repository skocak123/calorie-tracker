"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Food } from "@/lib/foods";

import { FoodListItem } from "./FoodListItem";
import { FoodListSkeleton } from "./FoodListSkeleton";

type InfiniteFoodListProps = {
  initialFoods: Food[];
  query: string;
  pageSize: number;
  currentUserId: string;
};

export function InfiniteFoodList({
  initialFoods,
  query,
  pageSize,
  currentUserId,
}: InfiniteFoodListProps) {
  const [foods, setFoods] = useState(initialFoods);
  const [hasMore, setHasMore] = useState(initialFoods.length === pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  // Kept in a ref so the next request always starts after the last loaded page,
  // even if the observer fires again before React re-renders.
  const offsetRef = useRef(initialFoods.length);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const params = new URLSearchParams({
        q: query,
        offset: String(offsetRef.current),
        limit: String(pageSize),
      });
      const response = await fetch(`/api/foods/search?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const { foods: nextFoods }: { foods: Food[] } = await response.json();
      offsetRef.current += nextFoods.length;
      setFoods((current) => {
        const seen = new Set(current.map((food) => food.id));
        return [...current, ...nextFoods.filter((food) => !seen.has(food.id))];
      });
      setHasMore(nextFoods.length === pageSize);
    } catch {
      setHasError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [query, pageSize]);

  // Load the next page when the bottom of the list comes into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || hasError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, hasError, loadMore]);

  return (
    <>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {foods.map((food) => (
          <FoodListItem key={food.id} food={food} isOwner={food.created_by === currentUserId} />
        ))}
        {isLoading && <FoodListSkeleton rows={4} />}
      </ul>

      {hasError && (
        <p className="py-4 text-center text-sm text-zinc-500">
          Laden is mislukt.{" "}
          <button type="button" onClick={loadMore} className="text-emerald-700 hover:underline dark:text-emerald-400">
            Opnieuw proberen
          </button>
        </p>
      )}

      {hasMore && <div ref={sentinelRef} aria-hidden="true" />}
    </>
  );
}
