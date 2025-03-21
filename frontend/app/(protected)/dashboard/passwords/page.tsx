// src/components/passwords/PasswordPage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategorySelector from "@/components/passwords/category-selector";
import PasswordListServer from "@/components/passwords/password-list-server";
import PasswordNewDrawer from "@/components/passwords/password-new-drawer";

type SearchParamsType = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  const params = await searchParams;

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Mis Claves</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus claves propias y externas
          </p>
        </div>
        <PasswordNewDrawer>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Clave
          </Button>
        </PasswordNewDrawer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>
              Selecciona una categoría para ver sus claves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategorySelector />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-9">
          <CardHeader>
            <CardTitle>Vista general de tus claves</CardTitle>
            <CardDescription>Vista general de tus claves</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordListServer searchParams={params} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
