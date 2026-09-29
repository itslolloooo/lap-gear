"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useRental,
} from "@/components/RentalProvider";

function Header() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    items,
  } =
    useRental();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const kitQuantity =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  const catalogActive =
    pathname.startsWith(
      "/catalogo"
    ) ||
    pathname.startsWith(
      "/prodotto"
    );


  const requestActive =
    pathname.startsWith(
      "/richiesta"
    );


  const adminActive =
    pathname.startsWith(
      "/admin"
    );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      document.body.style
        .overflow =
        previous;
    };
  }, [menuOpen]);

  function submitSearch(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value =
      search.trim();

    if (!value) {
      router.push(
        "/catalogo"
      );

      return;
    }

    router.push(
      `/catalogo?q=${encodeURIComponent(
        value
      )}`
    );

    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#ebeae4]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1680px] items-center gap-5 px-5 sm:px-8 lg:h-[88px] lg:px-10 xl:px-14">

          {/* =====================================
              BRAND
              ===================================== */}

          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3.5"
          >
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#ff5a1f] text-[15px] font-black tracking-[-0.03em] text-white transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-[1.03] lg:h-[50px] lg:w-[50px]">
              LAP
            </div>

            <div className="leading-none">
              <div className="text-[19px] font-black tracking-[-0.045em] lg:text-[21px]">
                LAP GEAR
              </div>

              <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-black/40">
                Video Rental
              </div>
            </div>
          </Link>

          {/* =====================================
              DESKTOP NAV
              ===================================== */}

          <nav className="ml-5 hidden h-full items-center gap-8 xl:flex">
            <NavLink
              href="/catalogo"
              active={
                catalogActive
              }
            >
              Catalogo
            </NavLink>

            <NavLink
              href="/#come-funziona"
              active={false}
            >
              Come funziona
            </NavLink>

            <NavLink
              href="/#contatti"
              active={false}
            >
              Contatti
            </NavLink>

            <NavLink
              href="/richiesta"
              active={
                requestActive
              }
            >
              Stato richiesta
            </NavLink>
          </nav>

          {/* =====================================
              RIGHT
              ===================================== */}

          <div className="ml-auto flex items-center gap-3">

            <form
              onSubmit={
                submitSearch
              }
              className="hidden lg:block"
            >
              <div className="flex h-[52px] w-[240px] items-center gap-3 rounded-[16px] border border-black/10 bg-white px-4 transition focus-within:border-black/25 focus-within:shadow-[0_8px_25px_rgba(0,0,0,0.05)] 2xl:w-[300px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-[18px] w-[18px] shrink-0 text-black/35"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Cerca gear..."
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/30"
                />
              </div>
            </form>

            {/* ADMIN */}

            <Link
              href="/admin"
              aria-label="Area admin"
              className={`
                hidden
                h-[52px]
                items-center
                justify-center
                rounded-[16px]
                border
                px-4
                text-[14px]
                font-semibold
                transition
                xl:flex

                ${
                  adminActive
                    ? "border-[#ff5a1f] bg-[#fff0e9] text-[#ff5a1f]"
                    : "border-black/10 bg-white text-black/55 hover:border-black/25 hover:text-[#181818]"
                }
              `}
            >
              Admin
            </Link>

            {/* KIT */}

            <Link
              href="/noleggio"
              className="group relative hidden h-[52px] items-center gap-4 rounded-[16px] bg-[#181818] px-5 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f] sm:flex"
            >
              <span>
                Il tuo kit
              </span>

              <span
                className={`
                  flex
                  h-7
                  min-w-7
                  items-center
                  justify-center
                  rounded-full
                  px-2
                  text-[12px]
                  font-bold
                  transition

                  ${
                    kitQuantity >
                    0
                      ? "bg-[#ff5a1f] text-white group-hover:bg-white group-hover:text-[#ff5a1f]"
                      : "bg-white/10 text-white/55 group-hover:bg-white/20 group-hover:text-white"
                  }
                `}
              >
                {
                  kitQuantity
                }
              </span>
            </Link>

            {/* MOBILE KIT */}

            <Link
              href="/noleggio"
              aria-label="Il tuo kit"
              className="relative flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#181818] text-white sm:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[20px] w-[20px]"
              >
                <path
                  d="M4 8H20L19 20H5L4 8Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="M8 9V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              {kitQuantity >
                0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5a1f] px-1 text-[10px] font-bold text-white">
                  {
                    kitQuantity
                  }
                </span>
              )}
            </Link>

            {/* MENU */}

            <button
              type="button"
              aria-label={
                menuOpen
                  ? "Chiudi menu"
                  : "Apri menu"
              }
              aria-expanded={
                menuOpen
              }
              onClick={() =>
                setMenuOpen(
                  (value) =>
                    !value
                )
              }
              className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-black/10 bg-white text-[#181818] transition hover:border-black/25 xl:hidden"
            >
              <div className="relative h-[18px] w-[20px]">
                <span
                  className={`absolute left-0 top-[3px] h-[2px] w-full rounded-full bg-current transition ${
                    menuOpen
                      ? "translate-y-[5px] rotate-45"
                      : ""
                  }`}
                />

                <span
                  className={`absolute left-0 top-[8px] h-[2px] w-full rounded-full bg-current transition ${
                    menuOpen
                      ? "opacity-0"
                      : ""
                  }`}
                />

                <span
                  className={`absolute left-0 top-[13px] h-[2px] w-full rounded-full bg-current transition ${
                    menuOpen
                      ? "-translate-y-[5px] -rotate-45"
                      : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================
          MOBILE / TABLET MENU
          ===================================== */}

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[78px] z-40 overflow-y-auto bg-[#ebeae4] px-5 py-6 sm:px-8 lg:top-[88px] xl:hidden">
          <div className="mx-auto max-w-[1680px]">

            <form
              onSubmit={
                submitSearch
              }
              className="mb-6"
            >
              <div className="flex h-[60px] items-center gap-3 rounded-[18px] border border-black/10 bg-white px-5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-black/35"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  autoFocus
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Cerca nel catalogo..."
                  className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/30"
                />
              </div>
            </form>

            <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white">
              <MobileNavLink
                number="01"
                href="/catalogo"
                title="Catalogo"
                description="Tutta l'attrezzatura"
              />

              <MobileNavLink
                number="02"
                href="/#come-funziona"
                title="Come funziona"
                description="Dal kit alla conferma"
              />

              <MobileNavLink
                number="03"
                href="/#contatti"
                title="Contatti"
                description="Parliamo del tuo progetto"
              />

              <MobileNavLink
                number="04"
                href="/richiesta"
                title="Stato richiesta"
                description="Segui la tua richiesta di noleggio"
              />

              <MobileNavLink
                number="05"
                href="/admin"
                title="Area admin"
                description="Gestione richieste e inventario"
              />
            </div>

            <Link
              href="/noleggio"
              className="mt-5 flex min-h-[72px] items-center justify-between rounded-[20px] bg-[#181818] px-6 text-white"
            >
              <div>
                <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                  Rental
                </div>

                <div className="mt-1 text-[18px] font-semibold">
                  Il tuo kit
                </div>
              </div>

              <div className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#ff5a1f] px-3 text-[14px] font-bold">
                {
                  kitQuantity
                }
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}


/* =========================================================
   NAV
   ========================================================= */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        relative
        flex
        h-full
        items-center
        text-[15px]
        font-semibold
        transition

        ${
          active
            ? "text-[#181818]"
            : "text-black/50 hover:text-[#181818]"
        }
      `}
    >
      {
        children
      }

      <span
        className={`
          absolute
          inset-x-0
          bottom-0
          h-[3px]
          rounded-t-full
          bg-[#ff5a1f]
          transition

          ${
            active
              ? "opacity-100"
              : "opacity-0"
          }
        `}
      />
    </Link>
  );
}

function MobileNavLink({
  number,
  href,
  title,
  description,
}: {
  number: string;
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-black/10 p-5 last:border-b-0"
    >
      <span className="text-[12px] font-bold text-[#ff5a1f]">
        {
          number
        }
      </span>

      <div>
        <div className="text-[22px] font-semibold tracking-[-0.035em]">
          {
            title
          }
        </div>

        <div className="mt-1 text-[14px] text-black/45">
          {
            description
          }
        </div>
      </div>

      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0efe9] text-[18px] transition group-hover:bg-[#ff5a1f] group-hover:text-white">
        →
      </span>
    </Link>
  );
}
export { Header };
export default Header;