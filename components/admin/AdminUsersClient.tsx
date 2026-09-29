"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


type Role =
  | "admin"
  | "operator"
  | "viewer";


type UserRow = {
  id:
    string;

  email:
    string;

  name:
    string;

  role:
    Role;

  active:
    boolean;

  isOwner:
    boolean;

  createdAt:
    string;

  lastSignInAt:
    string | null;
};


function roleLabel(
  role: Role
) {

  switch (
    role
  ) {

    case "admin":
      return "Admin";

    case "operator":
      return "Operatore";

    case "viewer":
      return "Viewer";

  }
}


function formatDateTime(
  value:
    string | null
) {

  if (!value) {
    return "Mai";
  }


  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}


export function AdminUsersClient() {

  const [
    users,
    setUsers,
  ] =
    useState<
      UserRow[]
    >([]);


  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    creating,
    setCreating,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const [
    editing,
    setEditing,
  ] =
    useState<
      Record<
        string,
        UserRow
      >
    >({});


  const loadUsers =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError(
          ""
        );


        try {

          const response =
            await fetch(
              "/api/admin/users",
              {
                cache:
                  "no-store",
              }
            );


          const result =
            await response.json();


          if (
            !response.ok ||
            !result?.ok
          ) {
            throw new Error(
              result?.error ??
              "Impossibile caricare gli utenti."
            );
          }


          const nextUsers =
            (
              result.users ??
              []
            ) as
              UserRow[];


          setUsers(
            nextUsers
          );


          setCurrentUserId(
            String(
              result.currentUserId ??
              ""
            )
          );


          setEditing(
            Object.fromEntries(
              nextUsers.map(
                (
                  user
                ) => [
                  user.id,
                  {
                    ...user,
                  },
                ]
              )
            )
          );

        } catch (
          loadError
        ) {

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Impossibile caricare gli utenti."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {
      void loadUsers();
    },
    [
      loadUsers,
    ]
  );


  const counts =
    useMemo(
      () => ({
        total:
          users.length,

        active:
          users.filter(
            (
              user
            ) =>
              user.active
          ).length,

        admins:
          users.filter(
            (
              user
            ) =>
              user.role ===
              "admin"
          ).length,
      }),
      [
        users,
      ]
    );


  async function createUser(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    const form =
      event.currentTarget;


    const data =
      new FormData(
        form
      );


    setCreating(
      true
    );

    setError(
      ""
    );

    setSuccess(
      ""
    );


    try {

      const response =
        await fetch(
          "/api/admin/users",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  data.get(
                    "name"
                  ),

                email:
                  data.get(
                    "email"
                  ),

                password:
                  data.get(
                    "password"
                  ),

                role:
                  data.get(
                    "role"
                  ),
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
          "Creazione utente non riuscita."
        );
      }


      form.reset();


      setSuccess(
        "Utente creato correttamente."
      );


      await loadUsers();

    } catch (
      createError
    ) {

      setError(
        createError instanceof
          Error
          ? createError.message
          : "Creazione utente non riuscita."
      );

    } finally {

      setCreating(
        false
      );

    }

  }


  async function saveUser(
    userId: string
  ) {

    const draft =
      editing[
        userId
      ];


    if (!draft) {
      return;
    }


    setError(
      ""
    );

    setSuccess(
      ""
    );


    try {

      const response =
        await fetch(
          "/api/admin/users",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId,

                name:
                  draft.name,

                role:
                  draft.role,

                active:
                  draft.active,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
          "Aggiornamento non riuscito."
        );
      }


      setSuccess(
        "Utente aggiornato."
      );


      await loadUsers();

    } catch (
      saveError
    ) {

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Aggiornamento non riuscito."
      );

    }

  }


  async function deleteUser(
    user:
      UserRow
  ) {

    const confirmed =
      window.confirm(
        `Eliminare definitivamente l'account di ${user.name}?`
      );


    if (!confirmed) {
      return;
    }


    setError(
      ""
    );

    setSuccess(
      ""
    );


    try {

      const response =
        await fetch(
          "/api/admin/users",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId:
                  user.id,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
          "Eliminazione non riuscita."
        );
      }


      setSuccess(
        "Utente eliminato."
      );


      await loadUsers();

    } catch (
      deleteError
    ) {

      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "Eliminazione non riuscita."
      );

    }

  }


  return (
    <div className="space-y-6">

      {/* STATS */}

      <section className="grid gap-3 sm:grid-cols-3">

        <Stat
          label="Utenti"
          value={
            counts.total
          }
        />

        <Stat
          label="Attivi"
          value={
            counts.active
          }
        />

        <Stat
          label="Admin"
          value={
            counts.admins
          }
        />

      </section>


      {/* CREATE */}

      <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">

        <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">

          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
            Nuovo account
          </div>


          <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
            Aggiungi un utente.
          </h2>


          <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-black/45">
            La password viene impostata
            subito. L'account può accedere
            con email e password dalla
            normale pagina Admin.
          </p>

        </div>


        <form
          onSubmit={
            createUser
          }
          className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7 xl:grid-cols-[1.1fr_1.2fr_1fr_220px_auto]"
        >

          <input
            name="name"
            required
            placeholder="Nome"
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white"
          />


          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white"
          />


          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password iniziale"
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white"
          />


          <select
            name="role"
            defaultValue="operator"
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] font-semibold outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white"
          >
            <option value="admin">
              Admin
            </option>

            <option value="operator">
              Operatore
            </option>

            <option value="viewer">
              Viewer
            </option>
          </select>


          <button
            type="submit"
            disabled={
              creating
            }
            className="h-[52px] rounded-[14px] bg-[#181818] px-6 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-wait disabled:opacity-50"
          >
            {creating
              ? "Creo..."
              : "+ Crea"}
          </button>

        </form>

      </section>


      {/* MESSAGES */}

      {error && (
        <div className="rounded-[18px] border border-[#cf3d32]/15 bg-[#fff0ee] px-5 py-4 text-[13px] font-semibold text-[#a9362d]">
          {error}
        </div>
      )}


      {success && (
        <div className="rounded-[18px] border border-[#168a50]/15 bg-[#e9f6ee] px-5 py-4 text-[13px] font-semibold text-[#168a50]">
          ✓ {success}
        </div>
      )}


      {/* USERS */}

      <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">

        <div className="border-b border-black/10 p-6 sm:p-7">

          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
            Accessi
          </div>


          <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
            Staff autorizzato.
          </h2>

        </div>


        {loading ? (

          <div className="p-8 text-[14px] text-black/40">
            Caricamento utenti...
          </div>

        ) : users.length ===
          0 ? (

          <div className="p-8 text-[14px] text-black/40">
            Nessun utente trovato.
          </div>

        ) : (

          <div className="divide-y divide-black/10">

            {users.map(
              (
                user
              ) => {

                const draft =
                  editing[
                    user.id
                  ] ??
                  user;


                const isSelf =
                  user.id ===
                  currentUserId;


                return (
                  <article
                    key={
                      user.id
                    }
                    className="p-6 sm:p-7"
                  >

                    <div className="grid gap-5 xl:grid-cols-[minmax(250px,1fr)_minmax(220px,0.8fr)_180px_150px_auto] xl:items-center">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <div className="text-[17px] font-semibold">
                            {user.name}
                          </div>


                          {user.isOwner && (
                            <span className="rounded-full bg-[#fff0e9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#ff5a1f]">
                              Owner
                            </span>
                          )}


                          {isSelf && (
                            <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-[#245bff]">
                              Tu
                            </span>
                          )}

                        </div>


                        <div className="mt-1 text-[13px] text-black/40">
                          {user.email}
                        </div>


                        <div className="mt-2 text-[11px] text-black/30">
                          Ultimo accesso:{" "}
                          {formatDateTime(
                            user.lastSignInAt
                          )}
                        </div>

                      </div>


                      <input
                        value={
                          draft.name
                        }
                        disabled={
                          user.isOwner
                        }
                        onChange={(
                          event
                        ) =>
                          setEditing(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                user.id
                              ]: {
                                ...draft,

                                name:
                                  event.target
                                    .value,
                              },
                            })
                          )
                        }
                        className="h-[48px] rounded-[13px] border border-black/10 bg-[#f5f4ef] px-4 text-[13px] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />


                      <select
                        value={
                          draft.role
                        }
                        disabled={
                          user.isOwner ||
                          isSelf
                        }
                        onChange={(
                          event
                        ) =>
                          setEditing(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                user.id
                              ]: {
                                ...draft,

                                role:
                                  event.target
                                    .value as
                                    Role,
                              },
                            })
                          )
                        }
                        className="h-[48px] rounded-[13px] border border-black/10 bg-[#f5f4ef] px-4 text-[13px] font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="admin">
                          Admin
                        </option>

                        <option value="operator">
                          Operatore
                        </option>

                        <option value="viewer">
                          Viewer
                        </option>
                      </select>


                      <button
                        type="button"
                        disabled={
                          user.isOwner ||
                          isSelf
                        }
                        onClick={() =>
                          setEditing(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                user.id
                              ]: {
                                ...draft,

                                active:
                                  !draft.active,
                              },
                            })
                          )
                        }
                        className={`h-[48px] rounded-[13px] px-4 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          draft.active
                            ? "bg-[#e9f6ee] text-[#168a50]"
                            : "bg-[#fff0ee] text-[#c33d32]"
                        }`}
                      >
                        {draft.active
                          ? "Attivo"
                          : "Disattivato"}
                      </button>


                      <div className="flex flex-wrap gap-2 xl:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            saveUser(
                              user.id
                            )
                          }
                          className="h-[44px] rounded-[12px] bg-[#181818] px-4 text-[12px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                        >
                          Salva
                        </button>


                        {!user.isOwner &&
                          !isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteUser(
                                user
                              )
                            }
                            className="h-[44px] rounded-[12px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 text-[12px] font-semibold text-[#b7352b] transition hover:bg-[#cf3d32] hover:text-white"
                          >
                            Elimina
                          </button>
                        )}

                      </div>

                    </div>


                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-black/35">

                      <span className="rounded-full bg-[#f1f0ea] px-3 py-1.5">
                        Ruolo:{" "}
                        {roleLabel(
                          user.role
                        )}
                      </span>


                      <span className="rounded-full bg-[#f1f0ea] px-3 py-1.5">
                        Creato:{" "}
                        {formatDateTime(
                          user.createdAt
                        )}
                      </span>

                    </div>

                  </article>
                );

              }
            )}

          </div>

        )}

      </section>


      <section className="rounded-[20px] border border-[#245bff]/15 bg-[#edf2ff] p-5 text-[13px] leading-6 text-[#245bff]">
        <strong>Ruoli:</strong>{" "}
        Admin = gestione completa. Operatore =
        attività operative di noleggio.
        Viewer = sola consultazione; i permessi
        delle altre pagine admin verranno collegati
        al nuovo sistema di ruoli nello step successivo.
      </section>

    </div>
  );
}


function Stat({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[20px] border border-black/10 bg-white p-5">

      <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-black/35">
        {label}
      </div>


      <div className="mt-2 text-[30px] font-semibold tracking-[-0.04em]">
        {value}
      </div>

    </div>
  );
}


export default AdminUsersClient;
