import { SessionProvider } from "next-auth/react";

import type { Metadata } from "next";

import "./globals.css";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Locker1 | Most secure password locker",
  description: "One of the most secure password locker",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className="overflow-y-scroll">{children}</body>
      </SessionProvider>
    </html>
  );
}
