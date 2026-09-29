import type {
  User,
} from "@supabase/supabase-js";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export type AdminRole =
  | "admin"
  | "operator"
  | "viewer";


export type AdminProfile = {
  user_id:
    string;

  name:
    string;

  role:
    AdminRole;

  active:
    boolean;

  is_owner:
    boolean;

  created_at:
    string;

  updated_at:
    string;
};


export type AdminAccess = {
  user:
    User;

  profile:
    AdminProfile;

  isOwner:
    boolean;
};


/* =========================================================
   CURRENT ACCESS
   ========================================================= */

export async function getCurrentAdminAccess():
  Promise<AdminAccess | null> {

  const auth =
    await createSupabaseAuthServerClient();


  const {
    data: {
      user,
    },
  } =
    await auth.auth.getUser();


  if (!user) {
    return null;
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    throw new Error(
      "Supabase non configurato."
    );
  }


  const ownerId =
    process.env.ADMIN_USER_ID ??
    "";


  const isOwner =
    Boolean(
      ownerId &&
      user.id === ownerId
    );


  /*
   * Il proprietario configurato in .env
   * non può rimanere accidentalmente
   * disattivato o senza ruolo admin.
   *
   * Se profiles è appena stata installata,
   * questo crea automaticamente il suo profilo.
   */

  if (isOwner) {

    const displayName =
      String(
        user.user_metadata
          ?.name ??
        user.email
          ?.split("@")[0] ??
        "Amministratore"
      ).trim();


    const {
      error:
        ownerProfileError,
    } =
      await supabase
        .from(
          "profiles"
        )
        .upsert(
          {
            user_id:
              user.id,

            name:
              displayName ||
              "Amministratore",

            role:
              "admin",

            active:
              true,

            is_owner:
              true,

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
      ownerProfileError
    ) {
      console.error(
        "Errore sincronizzazione profilo owner:",
        ownerProfileError
      );

      return null;
    }
  }


  const {
    data:
      profileData,
    error:
      profileError,
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
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();


  if (
    profileError
  ) {
    console.error(
      "Errore lettura profilo admin:",
      profileError
    );

    return null;
  }


  if (
    !profileData
  ) {
    return null;
  }


  const profile =
    profileData as
      AdminProfile;


  return {
    user,
    profile,
    isOwner:
      isOwner ||
      profile.is_owner,
  };
}


/* =========================================================
   REQUIRE ACCESS
   ========================================================= */

export async function requireAdminAccess(
  roles:
    AdminRole[] = [
      "admin",
      "operator",
      "viewer",
    ]
):
  Promise<AdminAccess | null> {

  const access =
    await getCurrentAdminAccess();


  if (
    !access ||
    !access.profile.active ||
    !roles.includes(
      access.profile.role
    )
  ) {
    return null;
  }


  return access;
}

