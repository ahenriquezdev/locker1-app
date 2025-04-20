"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getPasswordScore, getPasswordStrength } from "@/lib/utils";
import { createPassword } from "@/lib/actions/passwordActions";
import { ApiResponse, PasswordFormProps } from "@/lib/types";
import { showToastNotification } from "@/components/showToastNotification";

export default function PasswordNewForm({
  onActionComplete,
}: PasswordFormProps) {
  const [formData, setFormData] = useState({
    service: "",
    url: "",
    username: "",
    password: "",
    score: 0,
  });
  const [showPassword, setShowPassword] = useState(false);

  const initialState: ApiResponse.Response = {
    success: false,
    message: "",
    data: null,
    errors: [],
    display: false,
  };

  const [state, formAction, isPending] = useActionState<ApiResponse.Response>(
    createPassword,
    initialState,
  );

  const toastShownRef = useRef(false);
  const { success, message, errors, display = false } = state;

  useEffect(() => {
    if (state.display && !toastShownRef.current) {
      showToastNotification(state, {
        title: success ? "Operation successful" : "An error occurred",
        onDismiss: () => {
          toastShownRef.current = false;
        },
      });
      toastShownRef.current = true;
    }
  }, [state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "service" | "url" | "username" | "password",
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      let updatedState = {
        ...prev,
        [field]: value,
      };

      if (field === "password") {
        updatedState = {
          ...updatedState,
          score: getPasswordScore(value),
        };
      }

      return updatedState;
    });
  };

  useEffect(() => {
    if (success && !isPending && (!errors || errors.length === 0)) {
      setTimeout(() => {
        onActionComplete?.();
      }, 2000);
    }
  }, [success, isPending, errors, onActionComplete]);

  return (
    <form action={formAction} className="space-y-6 form-container">
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
        <Label htmlFor="url">Url del servicio</Label>
        <Input
          id="url"
          name="url"
          value={formData.url}
          onChange={(e) => handleInputChange(e, "url")}
          placeholder="ej. https://gmail.com"
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
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Complejidad:</span>
            <span className="text-sm text-muted-foreground">
              {formData.score}%
            </span>
          </div>
          <Progress value={formData.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas,
            números y símbolos.
          </p>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onActionComplete}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2"
        >
          Crear clave
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </form>
  );
}
