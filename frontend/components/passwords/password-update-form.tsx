// src/components/passwords/PasswordUpdateForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface PasswordUpdateFormProps {
  initialData: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  formAction?: string;
  isPending?: boolean;
}

export default function PasswordUpdateForm({
  initialData,
  onSubmit,
  onCancel,
  formAction,
  isPending,
}: PasswordUpdateFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6">
      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="service">Servicio</Label>
          <Input
            id="service"
            name="service"
            value={formData.service}
            onChange={(e) => handleInputChange(e, "service")}
            placeholder="ej. Gmail, Twitter, etc."
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={(e) => handleInputChange(e, "username")}
            placeholder="nombre de usuario o correo"
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange(e, "password")}
              className="pr-10 input-field"
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
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2"
          >
            Guardar cambios
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
