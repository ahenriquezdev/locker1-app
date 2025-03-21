// src/components/passwords/PasswordUpdateForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2, Copy } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface Password {
  id: string;
  user_id: string;
  service: string;
  username: string;
  password: string;
  score: number;
  strength: string;
  last_update: string;
  sharedTeams: string[];
}

interface PasswordViewDetailProps {
  selectedPassword: Password;
  onCancel: () => void;
}

// "id": "59a9fa28-7795-4c87-b907-68e13c7749ab",
//   "user_id": "9f367233-214e-4de1-9c96-376c37615c77",
//   "service": "facebook",
//   "username": "mark",
//   "password": "mark123.",
//   "score": 10,
//   "strength": "low",
//   "last_update": "2025-03-19T17:01:53.000Z",
//   "sharedTeams": []

export default function PasswordViewDetail({
  selectedPassword,
  onCancel,
}: PasswordViewDetailProps) {
  const {
    id,
    service,
    username,
    password,
    score,
    strength,
    last_update,
    sharedTeams,
  } = selectedPassword;
  const [showPassword, setShowPassword] = useState(false);
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      console.log(`${type} copiado exitosamente`),

      //   () => {
      //     toast({
      //       title: "Copiado al portapapeles",
      //       description: `${type} copiado exitosamente`,
      //     })
      //   },
      //   (err) => {
      //     console.error("Error al copiar: ", err)
      //   },
    );
  };

  // const handleClose = () => {
  //   onCancel();
  // };

  return (
    <div className="p-6">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Servicio:</span>
          <span className="font-semibold">{service}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Usuario:</span>
          <div className="flex items-center gap-2">
            <span>{username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(username, "Usuario")}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar usuario</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Contraseña:</span>
          <div className="flex items-center gap-2">
            <span>********</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleCopyToClipboard(selectedPassword?.password, "Contraseña")
              }
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar contraseña</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Complejidad:</span>
          <div className="flex items-center gap-2">
            <Progress value={score} className="w-[60px] h-2" />
            <span className="text-sm text-muted-foreground">{score}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Última Actualización:</span>
          <span>{formatRelativeTime(last_update)}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant={
              sharedTeams && sharedTeams.length > 0 ? "success" : "outline"
            }
          >
            {sharedTeams && sharedTeams.length > 0
              ? "Compartida"
              : "Sin compartir"}
          </Badge>
        </div>
      </div>
      <hr className="my-4 border-gray-200" />
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
