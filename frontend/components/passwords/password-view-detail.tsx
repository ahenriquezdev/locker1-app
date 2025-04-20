"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2, Copy } from "lucide-react";
import { formatRelativeTime, truncateString } from "@/lib/utils";
import { PasswordFormProps, PasswordModel } from "@/lib/types";
import { toast } from "sonner";

// interface PasswordViewDetailProps {
//   currentPassword: PasswordModel;
//   onCancel: () => void;
// }

export default function PasswordViewDetail({
  currentPassword,
  onActionComplete,
}: PasswordFormProps) {
  const {
    id,
    service,
    url,
    username,
    password,
    score,
    strength,
    updatedAt,
    isShared,
    sharedWithUser,
    sharedFromGroup,
  } = currentPassword as PasswordModel;
  const [showPassword, setShowPassword] = useState(false);
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.info(`${type} was successfully copied to clipboard`);
      },
      () => {
        toast.warning(`An error occurred while copying ${type}`);
      },
    );
  };

  return (
    <div className="p-6">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Servicio:</span>
          <span className="font-semibold">{service}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Url:</span>
          <div className="flex items-center gap-2">
            <span>{truncateString(url, 20)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(url, "Url")}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar url</span>
            </Button>
          </div>
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
              onClick={() => handleCopyToClipboard(password, "Contraseña")}
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
          <span>{formatRelativeTime(updatedAt)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={isShared ? "success" : "outline"}>
            {isShared ? "Compartida" : "Sin compartir"}
          </Badge>
        </div>
      </div>
      <hr className="my-4 border-gray-200" />
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onActionComplete}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
