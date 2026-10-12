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


type WorkflowAction =
  | "confirm"
  | "pickup"
  | "return"
  | "cancel";


type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";


type AssignmentRow = {
  id: number;
};


type ReservationItemRow = {
  id: number;
  quantity: number;

  unit_assignments:
    | AssignmentRow[]
    | null;
};


type ConditionCheckRow = {
  unit_assignment_id:
    number;
};


function statusForAction(
  action:
    WorkflowAction
): ReservationStatus {
  switch (action) {
    case "confirm":
      return "confirmed";

    case "pickup":
      return "picked_up";

    case "return":
      return "returned";

    case "cancel":
      return "cancelled";
  }
}


function successMessage(
  action:
    WorkflowAction
) {
  switch (action) {
    case "confirm":
      return "Richiesta confermata.";

    case "pickup":
      return "Materiale segnato come consegnato al cliente.";

    case "return":
      return "Materiale segnato come riconsegnato.";

    case "cancel":
      return "Richiesta annullata.";
  }
}


export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const access =
    await requireAdminAccess([
      "admin",
      "operator",
    ]);

  if (!access) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Non autorizzato.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    id,
  } =
    await params;

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ID richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }

  let body:
    {
      action?:
        WorkflowAction;
    };

  try {
    body =
      (await request.json()) as {
        action?:
          WorkflowAction;
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

  const action =
    body.action;

  if (
    !action ||
    ![
      "confirm",
      "pickup",
      "return",
      "cancel",
    ].includes(
      action
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Azione non valida.",
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
      reservation,
    error:
      reservationError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .select(
        "id,status"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (
    reservationError
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          reservationError.message,
      },
      {
        status: 500,
      }
    );
  }

  if (!reservation) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Richiesta non trovata.",
      },
      {
        status: 404,
      }
    );
  }

  const currentStatus =
    reservation.status as
      ReservationStatus;

  if (
    action === "cancel" &&
    ![
      "requested",
      "confirmed",
    ].includes(
      currentStatus
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Puoi annullare una richiesta solo prima della consegna del materiale.",
      },
      {
        status: 409,
      }
    );
  }

  const expectedStatus:
    Partial<
      Record<
        WorkflowAction,
        ReservationStatus
      >
    > = {
      confirm:
        "requested",
      pickup:
        "confirmed",
      return:
        "picked_up",
    };

  const expected =
    expectedStatus[
      action
    ];

  if (
    expected &&
    currentStatus !==
      expected
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Lo stato della richiesta è cambiato. Aggiorna la pagina e riprova.",
      },
      {
        status: 409,
      }
    );
  }

  /*
   * Per consegna e rientro completiamo automaticamente
   * solo i controlli ancora mancanti con "Tutto OK".
   * Eventuali controlli già registrati (anche con anomalie)
   * NON vengono sovrascritti.
   */
  if (
    action === "pickup" ||
    action === "return"
  ) {
    const {
      data:
        itemData,
      error:
        itemError,
    } =
      await supabase
        .from(
          "reservation_items"
        )
        .select(
          `
            id,
            quantity,
            unit_assignments (
              id
            )
          `
        )
        .eq(
          "reservation_id",
          id
        );

    if (itemError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            itemError.message,
        },
        {
          status: 500,
        }
      );
    }

    const items =
      (itemData ??
        []) as unknown as
        ReservationItemRow[];

    if (
      items.length ===
      0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La richiesta non contiene materiale.",
        },
        {
          status: 409,
        }
      );
    }

    const incompleteItem =
      items.find(
        (
          item
        ) =>
          (
            item.unit_assignments
              ?.length ??
            0
          ) <
          Number(
            item.quantity
          )
      );

    if (incompleteItem) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Assegna tutte le unità fisiche prima di proseguire.",
        },
        {
          status: 409,
        }
      );
    }

    const assignmentIds =
      items.flatMap(
        (
          item
        ) =>
          (
            item.unit_assignments ??
            []
          ).map(
            (
              assignment
            ) =>
              Number(
                assignment.id
              )
          )
      );

    const stage =
      action ===
      "pickup"
        ? "checkout"
        : "return";

    const existingIds =
      new Set<number>();

    if (
      assignmentIds.length >
      0
    ) {
      const {
        data:
          checkData,
        error:
          checkError,
      } =
        await supabase
          .from(
            "unit_condition_checks"
          )
          .select(
            "unit_assignment_id"
          )
          .in(
            "unit_assignment_id",
            assignmentIds
          )
          .eq(
            "stage",
            stage
          );

      if (checkError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              checkError.message,
          },
          {
            status: 500,
          }
        );
      }

      (
        (
          checkData ??
          []
        ) as ConditionCheckRow[]
      ).forEach(
        (
          row
        ) =>
          existingIds.add(
            Number(
              row.unit_assignment_id
            )
          )
      );
    }

    for (
      const assignmentId
      of assignmentIds
    ) {
      if (
        existingIds.has(
          assignmentId
        )
      ) {
        continue;
      }

      const {
        data:
          checkResult,
        error:
          saveError,
      } =
        await supabase.rpc(
          "save_unit_condition_check_safe",
          {
            p_assignment_id:
              assignmentId,
            p_stage:
              stage,
            p_condition:
              "ok",
            p_notes:
              "",
          }
        );

      if (saveError) {
        console.error(
          "Errore controllo rapido:",
          saveError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              saveError.message ??
              "Impossibile registrare il controllo materiale.",
          },
          {
            status: 500,
          }
        );
      }

      const parsed =
        checkResult as
          | {
              ok?:
                boolean;
              message?:
                string;
            }
          | null;

      if (
        !parsed?.ok
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              parsed?.message ??
              "Impossibile registrare il controllo materiale.",
          },
          {
            status: 409,
          }
        );
      }
    }
  }

  const targetStatus =
    statusForAction(
      action
    );

  const {
    data:
      statusResult,
    error:
      statusError,
  } =
    await supabase.rpc(
      "set_reservation_status_safe",
      {
        p_reservation_id:
          id,
        p_status:
          targetStatus,
      }
    );

  if (statusError) {
    console.error(
      "Errore workflow richiesta:",
      statusError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          statusError.message ??
          "Impossibile aggiornare lo stato.",
      },
      {
        status: 500,
      }
    );
  }

  const result =
    statusResult as
      | {
          ok?: boolean;
          code?: string;
          message?: string;
          missing?: number;
        }
      | null;

  if (
    !result?.ok
  ) {
    return NextResponse.json(
      {
        ok: false,
        code:
          result?.code ??
          "workflow_failed",
        error:
          result?.message ??
          "Impossibile completare l'operazione.",
        missing:
          result?.missing ??
          null,
      },
      {
        status: 409,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    status:
      targetStatus,
    message:
      successMessage(
        action
      ),
  });
}
