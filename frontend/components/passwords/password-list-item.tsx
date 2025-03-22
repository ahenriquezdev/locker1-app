"use client";

import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getPasswordStrength } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import PasswordUpdateForm from "@/components/passwords/password-update-form";
import PasswordViewDetail from "@/components/passwords/password-view-detail";
import { PasswordModel } from "@/lib/types";

type SearchParamsType = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface PasswordListItemProps {
  password: PasswordModel;
  searchParams: SearchParamsType;
}

export default function PasswordListItem({
  password,
  searchParams,
}: PasswordListItemProps) {
  // const params = await searchParams;
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const handleViewPassword = () => {
    setIsViewDrawerOpen(false);
  };

  const handleUpdatePassword = (passwordData: any) => {
    console.log("Contraseña actualizada:", passwordData);
    setIsEditDrawerOpen(false);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{password.service}</TableCell>
      <TableCell>{password.username}</TableCell>
      <TableCell>
        <Badge
          variant={
            password.sharedTeams && password.sharedTeams.length > 0
              ? "success"
              : "outline"
          }
        >
          {password.sharedTeams && password.sharedTeams.length > 0
            ? "Compartida"
            : "Sin compartir"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getPasswordStrength(password.strength)}>
          {password.strength}
        </Badge>
      </TableCell>
      <TableCell>{formatRelativeTime(password.last_update)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsViewDrawerOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Ver detalles</span>
            </DropdownMenuItem>
            <>
              <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalles de la Clave</DrawerTitle>
            <DrawerDescription>
              Información detallada de la clave para {password.service}
            </DrawerDescription>
          </DrawerHeader>
          <PasswordViewDetail
            selectedPassword={password}
            onCancel={() => setIsViewDrawerOpen(false)}
          />
        </DrawerContent>
      </Drawer>

      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Clave</DrawerTitle>
            <DrawerDescription>
              Modifica los detalles de la clave
            </DrawerDescription>
          </DrawerHeader>
          <PasswordUpdateForm
            initialData={password}
            onSubmit={handleUpdatePassword}
            onCancel={() => setIsEditDrawerOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </TableRow>
  );
}
