import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { FOODS_PAGE_SIZE, searchFoods } from "@/lib/foods";
import { createClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  q: z.string().trim().max(100).default(""),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(FOODS_PAGE_SIZE),
});

// GET /api/foods/search?q=kip&offset=30&limit=30
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const params = paramsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!params.success) {
    return NextResponse.json({ error: "Ongeldige parameters." }, { status: 400 });
  }

  const { q, offset, limit } = params.data;
  const foods = await searchFoods(q, limit, offset);

  return NextResponse.json({ foods });
}
