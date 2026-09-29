"use client";

import { useRouter } from "next/navigation";

import {
  createSupabaseAuthBrowserClient,
} from "@/lib/supabase-auth-client";

export default function AdminLogoutButton() {
  const router =
    useRouter();

  async function handleLogout() {
    const supabase =
      createSupabaseAuthBrowserClient();

    await supabase.auth.signOut();

    router.replace(
      "/admin/login"
    );

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={
        handleLogout
      }
      className="secondaryAction"
      style={{
        border: 0,
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}