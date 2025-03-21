import { SessionProvider } from "next-auth/react";

import type { Metadata } from "next";

import "./globals.css";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Locker1 | Most secure password locker",
  description: "One of the most secure password locker",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="overflow-y-scroll">
        <SessionProvider>
          {children}
          <Toaster richColors theme="light" />
        </SessionProvider>
      </body>
    </html>
  );
}
