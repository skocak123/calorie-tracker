import Form from "next/form";
import Link from "next/link";

import { FoodListItem } from "@/components/foods/FoodListItem";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { requireUser } from "@/lib/auth";
import { searchFoods } from "@/lib/foods";

export default async function FoodsPage({ searchParams }: PageProps<"/foods">) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const foods = await searchFoods(query);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Producten</h1>
        <Link href="/foods/new" className={buttonStyles("primary")}>
          Product toevoegen
        </Link>
      </div>

      <Form action="/foods" className="flex gap-2">
        <Input
          name="q"
          type="search"
          placeholder="Zoek een product, bijvoorbeeld kipfilet"
          defaultValue={query}
          aria-label="Zoek een product"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Zoeken
        </Button>
      </Form>

      <Card className="py-2">
        {foods.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            {query ? `Geen producten gevonden voor "${query}".` : "Er zijn nog geen producten."}{" "}
            <Link href="/foods/new" className="text-emerald-700 hover:underline dark:text-emerald-400">
              Voeg er een toe.
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {foods.map((food) => (
              <FoodListItem key={food.id} food={food} isOwner={food.created_by === user.id} />
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-zinc-500">Alle waarden zijn per 100 g.</p>
    </div>
  );
}
