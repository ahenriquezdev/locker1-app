"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// import { toast } from "@/components/ui/use-toast"

interface PasswordFormProps {
  initialData?: {
    id?: number;
    service: string;
    username: string;
    password: string;
  };
  onSubmit: (data: {
    service: string;
    username: string;
    password: string;
  }) => void;
  onCancel: () => void;
}

export function PasswordForm({
  initialData,
  onSubmit,
  onCancel,
}: PasswordFormProps) {
  const [formData, setFormData] = useState({
    service: initialData?.service || "",
    username: initialData?.username || "",
    password: initialData?.password || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordComplexity, setPasswordComplexity] = useState(0);

  const calculatePasswordComplexity = (password: string) => {
    let complexity = 0;

    if (password.length >= 8) complexity += 25;
    if (password.match(/[A-Z]/)) complexity += 25;
    if (password.match(/[0-9]/)) complexity += 25;
    if (password.match(/[^A-Za-z0-9]/)) complexity += 25;

    return complexity;
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    setPasswordComplexity(calculatePasswordComplexity(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.service.trim() ||
      !formData.username.trim() ||
      !formData.password
    ) {
      // toast({
      //   title: "Error",
      //   description: "Todos los campos son requeridos",
      //   variant: "destructive",
      // })
      return;
    }

    if (passwordComplexity < 75 && !initialData) {
      toast({
        title: "Advertencia",
        description:
          "La contraseña es débil. Considera usar una contraseña más segura.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="service">Servicio</Label>
        <Input
          id="service"
          value={formData.service}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, service: e.target.value }))
          }
          placeholder="ej. Gmail, Twitter, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, username: e.target.value }))
          }
          placeholder="nombre de usuario o correo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!initialData && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Complejidad:
              </span>
              <span className="text-sm text-muted-foreground">
                {passwordComplexity}%
              </span>
            </div>
            <Progress value={passwordComplexity} className="h-2" />
            <p className="text-xs text-muted-foreground">
              La contraseña debe tener al menos 8 caracteres, incluir
              mayúsculas, números y símbolos.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Guardar cambios" : "Crear clave"}
        </Button>
      </div>
    </form>
  );
}
