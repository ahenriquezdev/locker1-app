"use client";

import React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function UserAvatarPage() {
  const { data: session, status } = useSession();
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        La forma más segura de gestionar tus contraseñas
      </h1>
      <p className="text-muted-foreground">
        "Locker1 ha revolucionado la forma en que gestionamos las contraseñas en
        nuestro equipo. La seguridad y facilidad de uso son excepcionales."
      </p>
      <div className="space-y-2">
        <div className="relative h-12 w-12 mx-auto">
          <Image
            src="https://randomuser.me/api/portraits/women/4.jpg"
            alt="Avatar"
            className="rounded-full"
            width={48}
            height={48}
          />
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div>
          <p className="font-semibold">
            {session ? session?.user?.name : "María González"}
          </p>
          <p className="text-sm text-muted-foreground">
            Directora de Tecnología
          </p>
        </div>
      </div>
    </div>
  );
}
