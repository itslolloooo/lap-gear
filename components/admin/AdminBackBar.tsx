"use client";

import { usePathname, useRouter } from "next/navigation";

function getParentPath(pathname: string) {
  if (
    pathname === "/admin" ||
    pathname === "/admin/login"
  ) {
    return null;
  }

  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  if (segments.length <= 2) {
    return "/admin";
  }

  return `/${segments.slice(0, -1).join("/")}`;
}

function getParentLabel(parentPath: string | null) {
  if (!parentPath || parentPath === "/admin") {
    return "Dashboard";
  }

  if (parentPath === "/admin/prodotti") {
    return "Prodotti";
  }

  if (parentPath === "/admin/inventario") {
    return "Inventario";
  }

  if (parentPath === "/admin/richieste") {
    return "Richieste";
  }

  if (parentPath === "/admin/categorie") {
    return "Categorie";
  }

  if (parentPath === "/admin/calendario") {
    return "Calendario";
  }

  if (parentPath === "/admin/utenti") {
    return "Utenti";
  }

  return "Indietro";
}

export function AdminBackBar() {
  const pathname = usePathname();
  const router = useRouter();

  const parentPath =
    getParentPath(pathname);

  if (!parentPath) {
    return null;
  }

  const label =
    getParentLabel(parentPath);

  return (
    <div className="bg-[#ebeae4] px-5 pt-5 sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto flex max-w-[1680px] items-center">
        <button
          type="button"
          onClick={() => router.push(parentPath)}
          className="group inline-flex h-[46px] items-center gap-3 rounded-[14px] border border-black/10 bg-white px-4 text-[13px] font-semibold text-black/60 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:border-black/20 hover:text-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
          aria-label={`Torna a ${label}`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f0ea] text-[16px] transition group-hover:bg-[#181818] group-hover:text-white">
            ←
          </span>

          <span>
            {label}
          </span>
        </button>
      </div>
    </div>
  );
}

export default AdminBackBar;
