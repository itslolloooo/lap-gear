import {
  NextResponse,
} from "next/server";

import {
  requireAdminAccess,
  type AdminRole,
} from "@/lib/admin-auth";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


const VALID_ROLES =
  new Set<AdminRole>([
    "admin",
    "operator",
    "viewer",
  ]);


/* =========================================================
   HELPERS
   ========================================================= */

function jsonError(
  error: string,
  status: number
) {
  return NextResponse.json(
    {
      ok: false,
      error,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}


async function requireManager() {

  const access =
    await requireAdminAccess([
      "admin",
    ]);


  if (!access) {
    return null;
  }


  return access;
}


/* =========================================================
   GET USERS
   ========================================================= */

export async function GET() {

  const access =
    await requireManager();


  if (!access) {
    return jsonError(
      "Non autorizzato.",
      401
    );
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return jsonError(
      "Servizio temporaneamente non disponibile.",
      500
    );
  }


  const {
    data:
      usersData,
    error:
      usersError,
  } =
    await supabase.auth.admin
      .listUsers({
        page:
          1,

        perPage:
          1000,
      });


  if (
    usersError
  ) {
    console.error(
      "Errore lista utenti auth:",
      usersError
    );

    return jsonError(
      "Impossibile caricare gli utenti.",
      500
    );
  }


  const {
    data:
      profiles,
    error:
      profilesError,
  } =
    await supabase
      .from(
        "profiles"
      )
      .select(
        `
          user_id,
          name,
          role,
          active,
          is_owner,
          created_at,
          updated_at
        `
      );


  if (
    profilesError
  ) {
    console.error(
      "Errore lista profiles:",
      profilesError
    );

    return jsonError(
      "Impossibile caricare i profili.",
      500
    );
  }


  const profileMap =
    new Map(
      (
        profiles ??
        []
      ).map(
        (
          profile
        ) => [
          String(
            profile.user_id
          ),
          profile,
        ]
      )
    );


  const ownerId =
    process.env.ADMIN_USER_ID ??
    "";


  const users =
    usersData.users
      .map(
        (
          user
        ) => {

          const profile =
            profileMap.get(
              user.id
            );


          return {
            id:
              user.id,

            email:
              user.email ??
              "",

            name:
              String(
                profile?.name ??
                user.user_metadata
                  ?.name ??
                user.email
                  ?.split("@")[0] ??
                "Utente"
              ),

            role:
              (
                profile?.role ??
                (
                  user.id ===
                  ownerId
                    ? "admin"
                    : "operator"
                )
              ) as AdminRole,

            active:
              profile?.active ??
              (
                user.id ===
                ownerId
              ),

            isOwner:
              user.id ===
                ownerId ||
              Boolean(
                profile
                  ?.is_owner
              ),

            createdAt:
              profile
                ?.created_at ??
              user.created_at,

            lastSignInAt:
              user.last_sign_in_at ??
              null,
          };
        }
      )
      .sort(
        (
          a,
          b
        ) => {

          if (
            a.isOwner !==
            b.isOwner
          ) {
            return a.isOwner
              ? -1
              : 1;
          }


          return a.name.localeCompare(
            b.name,
            "it"
          );
        }
      );


  return NextResponse.json(
    {
      ok: true,

      currentUserId:
        access.user.id,

      users,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}


/* =========================================================
   CREATE USER
   ========================================================= */

export async function POST(
  request: Request
) {

  const access =
    await requireManager();


  if (!access) {
    return jsonError(
      "Non autorizzato.",
      401
    );
  }


  let body:
    Record<
      string,
      unknown
    >;


  try {
    body =
      await request.json();
  } catch {
    return jsonError(
      "Dati non validi.",
      400
    );
  }


  const name =
    String(
      body.name ??
      ""
    ).trim();


  const email =
    String(
      body.email ??
      ""
    )
      .trim()
      .toLowerCase();


  const password =
    String(
      body.password ??
      ""
    );


  const role =
    String(
      body.role ??
      "operator"
    ) as
      AdminRole;


  if (
    name.length < 2 ||
    name.length > 120
  ) {
    return jsonError(
      "Inserisci un nome valido.",
      400
    );
  }


  if (
    !email ||
    email.length > 200 ||
    !email.includes("@")
  ) {
    return jsonError(
      "Inserisci un'email valida.",
      400
    );
  }


  if (
    password.length < 8
  ) {
    return jsonError(
      "La password deve contenere almeno 8 caratteri.",
      400
    );
  }


  if (
    !VALID_ROLES.has(
      role
    )
  ) {
    return jsonError(
      "Ruolo non valido.",
      400
    );
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return jsonError(
      "Servizio temporaneamente non disponibile.",
      500
    );
  }


  const {
    data:
      created,
    error:
      createError,
  } =
    await supabase.auth.admin
      .createUser({
        email,
        password,

        email_confirm:
          true,

        user_metadata: {
          name,
        },
      });


  if (
    createError ||
    !created.user
  ) {
    console.error(
      "Errore creazione utente:",
      createError
    );

    return jsonError(
      createError?.message ??
      "Creazione utente non riuscita.",
      400
    );
  }


  const {
    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles"
      )
      .insert({
        user_id:
          created.user.id,

        name,

        role,

        active:
          true,

        is_owner:
          false,

        updated_at:
          new Date()
            .toISOString(),
      });


  if (
    profileError
  ) {

    await supabase.auth.admin
      .deleteUser(
        created.user.id
      );


    console.error(
      "Errore creazione profilo:",
      profileError
    );


    return jsonError(
      "Account creato ma profilo non salvato. Operazione annullata.",
      500
    );
  }


  return NextResponse.json(
    {
      ok: true,
      userId:
        created.user.id,
    },
    {
      status:
        201,
    }
  );
}


/* =========================================================
   UPDATE USER
   ========================================================= */

export async function PATCH(
  request: Request
) {

  const access =
    await requireManager();


  if (!access) {
    return jsonError(
      "Non autorizzato.",
      401
    );
  }


  let body:
    Record<
      string,
      unknown
    >;


  try {
    body =
      await request.json();
  } catch {
    return jsonError(
      "Dati non validi.",
      400
    );
  }


  const userId =
    String(
      body.userId ??
      ""
    ).trim();


  const name =
    String(
      body.name ??
      ""
    ).trim();


  const role =
    String(
      body.role ??
      ""
    ) as
      AdminRole;


  const active =
    Boolean(
      body.active
    );


  if (!userId) {
    return jsonError(
      "Utente non valido.",
      400
    );
  }


  if (
    name.length < 2 ||
    name.length > 120
  ) {
    return jsonError(
      "Nome non valido.",
      400
    );
  }


  if (
    !VALID_ROLES.has(
      role
    )
  ) {
    return jsonError(
      "Ruolo non valido.",
      400
    );
  }


  const ownerId =
    process.env.ADMIN_USER_ID ??
    "";


  if (
    userId === ownerId &&
    (
      role !== "admin" ||
      !active
    )
  ) {
    return jsonError(
      "L'amministratore principale non può essere disattivato o declassato.",
      409
    );
  }


  if (
    userId ===
      access.user.id &&
    (
      role !== "admin" ||
      !active
    )
  ) {
    return jsonError(
      "Non puoi disattivare o rimuovere il tuo stesso ruolo admin.",
      409
    );
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return jsonError(
      "Servizio temporaneamente non disponibile.",
      500
    );
  }


  const {
    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles"
      )
      .upsert(
        {
          user_id:
            userId,

          name,

          role:
            userId ===
              ownerId
              ? "admin"
              : role,

          active:
            userId ===
              ownerId
              ? true
              : active,

          is_owner:
            userId ===
              ownerId,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "user_id",
        }
      );


  if (
    profileError
  ) {
    console.error(
      "Errore aggiornamento profilo:",
      profileError
    );

    return jsonError(
      "Impossibile aggiornare l'utente.",
      500
    );
  }


  const {
    error:
      metadataError,
  } =
    await supabase.auth.admin
      .updateUserById(
        userId,
        {
          user_metadata: {
            name,
          },
        }
      );


  if (
    metadataError
  ) {
    console.error(
      "Errore aggiornamento metadata:",
      metadataError
    );
  }


  return NextResponse.json({
    ok: true,
  });
}


/* =========================================================
   DELETE USER
   ========================================================= */

export async function DELETE(
  request: Request
) {

  const access =
    await requireManager();


  if (!access) {
    return jsonError(
      "Non autorizzato.",
      401
    );
  }


  let body:
    Record<
      string,
      unknown
    >;


  try {
    body =
      await request.json();
  } catch {
    return jsonError(
      "Dati non validi.",
      400
    );
  }


  const userId =
    String(
      body.userId ??
      ""
    ).trim();


  if (!userId) {
    return jsonError(
      "Utente non valido.",
      400
    );
  }


  const ownerId =
    process.env.ADMIN_USER_ID ??
    "";


  if (
    userId ===
      ownerId
  ) {
    return jsonError(
      "L'amministratore principale non può essere eliminato.",
      409
    );
  }


  if (
    userId ===
      access.user.id
  ) {
    return jsonError(
      "Non puoi eliminare il tuo stesso account.",
      409
    );
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return jsonError(
      "Servizio temporaneamente non disponibile.",
      500
    );
  }


  const {
    error,
  } =
    await supabase.auth.admin
      .deleteUser(
        userId
      );


  if (error) {
    console.error(
      "Errore eliminazione utente:",
      error
    );

    return jsonError(
      error.message ??
      "Impossibile eliminare l'utente.",
      500
    );
  }


  return NextResponse.json({
    ok: true,
  });
}
