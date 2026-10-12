import {
  NextResponse,
} from "next/server";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


function slugify(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


export async function POST(
  request: Request
) {
  const access =
    await requireAdminAccess([
      "admin",
    ]);

  if (
    !access ||
    !access.isOwner
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Non autorizzato.",
      },
      {
        status: 403,
      }
    );
  }

  let body:
    {
      name?: string;
    };

  try {
    body =
      (await request.json()) as {
        name?: string;
      };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dati non validi.",
      },
      {
        status: 400,
      }
    );
  }

  const name =
    String(
      body.name ??
      ""
    ).trim();

  if (
    name.length < 2 ||
    name.length > 60
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Il nome categoria deve contenere da 2 a 60 caratteri.",
      },
      {
        status: 400,
      }
    );
  }

  const baseSlug =
    slugify(
      name
    );

  if (!baseSlug) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossibile generare lo slug della categoria.",
      },
      {
        status: 400,
      }
    );
  }

  const supabase =
    getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Servizio temporaneamente non disponibile.",
      },
      {
        status: 500,
      }
    );
  }

  const {
    data:
      existing,
    error:
      existingError,
  } =
    await supabase
      .from(
        "categories"
      )
      .select(
        "id,name,slug"
      )
      .ilike(
        "name",
        name
      );

  if (existingError) {
    return NextResponse.json(
      {
        ok: false,
        error:
          existingError.message,
      },
      {
        status: 500,
      }
    );
  }

  if (
    (
      existing ??
      []
    ).length > 0
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Esiste già una categoria con questo nome.",
      },
      {
        status: 409,
      }
    );
  }

  let slug =
    baseSlug;

  let suffix =
    2;

  while (true) {
    const {
      data:
        slugMatch,
      error:
        slugError,
    } =
      await supabase
        .from(
          "categories"
        )
        .select(
          "id"
        )
        .eq(
          "slug",
          slug
        )
        .maybeSingle();

    if (slugError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            slugError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!slugMatch) {
      break;
    }

    slug =
      `${baseSlug}-${suffix}`;

    suffix +=
      1;

    if (suffix > 999) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Impossibile generare uno slug univoco per la categoria.",
        },
        {
          status: 409,
        }
      );
    }
  }

  const {
    data:
      lastCategory,
    error:
      lastError,
  } =
    await supabase
      .from(
        "categories"
      )
      .select(
        "position"
      )
      .order(
        "position",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (lastError) {
    return NextResponse.json(
      {
        ok: false,
        error:
          lastError.message,
      },
      {
        status: 500,
      }
    );
  }

  const nextPosition =
    Number(
      lastCategory?.position ??
      0
    ) + 10;

  const {
    data:
      category,
    error:
      insertError,
  } =
    await supabase
      .from(
        "categories"
      )
      .insert({
        name,
        slug,
        position:
          nextPosition,
        active:
          true,
      })
      .select(
        "id,name,slug,position,active"
      )
      .single();

  if (insertError) {
    return NextResponse.json(
      {
        ok: false,
        error:
          insertError.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      category,
    },
    {
      status: 201,
    }
  );
}
