"use client";

import { useActionState, useState } from "react";
import { signInWithCredentials } from "@/lib/actions/authActions";
import { signIn } from "next-auth/react";
import { ApiResponseType } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [state, handleSignIn, isPending] = useActionState<ApiResponseType>(
    signInWithCredentials,
    { success: false, message: "", errors: [] },
  );
  const { success = false, message = "", errors = [] } = state;
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleSignIn = async () => {
    await signIn("google", {
      redirect: true,
      redirectTo: "/dashboard",
    });
  };

  return (
    <form action={handleSignIn} className="space-y-4 form-container">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          required
          autoComplete="false"
          className="input-field"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/recuperar-password"
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="false"
          className="input-field"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          name="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        <label
          htmlFor="remember"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Recordarme por 30 días
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-input" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Iniciar sesión con Google
      </Button>
      {!success && <p style={{ color: "red" }}>{message}</p>}
      {errors && (
        <ul>
          {errors.map((err, index) => (
            <li key={index} style={{ color: "orange" }}>
              {err.message}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
