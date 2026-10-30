import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  AdminBackBar,
} from "@/components/admin/AdminBackBar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AdminBackBar />
      {children}
    </>
  );
}
