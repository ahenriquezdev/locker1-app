"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
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
import { ApiResponse, PasswordModel } from "@/lib/types";
import { getPasswordById, deletePassword } from "@/lib/actions/passwordActions";
import { useRouter } from "next/navigation";
import { showToastNotification } from "@/components/showToastNotification";

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
  const [currentPassword, setCurrentPassword] = useState<PasswordModel | null>(
    null,
  );

  const toastShownRef = useRef(false);
  const router = useRouter();

  const handledViewDetail = async () => {
    const result = await getPasswordById(password.id);

    if (!result || !result.success) {
      return;
    }

    setCurrentPassword(result?.data?.password as PasswordModel);
    setIsViewDrawerOpen(true);
  };

  const handleUpdatePassword = async () => {
    const result = await getPasswordById(password.id);

    if (!result || !result.success) {
      return;
    }

    setCurrentPassword(result?.data?.password as PasswordModel);
    setIsEditDrawerOpen(true);
  };

  const handlePasswordDelete = async () => {
    const formData = new FormData();
    formData.append("id", password.id.toString());

    const result: ApiResponse.Response = await deletePassword(formData);

    const { display, success } = result;

    if (display && !toastShownRef.current) {
      showToastNotification(result, {
        title: success ? "Operation successful" : "An error occurred",
        onDismiss: () => {
          toastShownRef.current = false;
        },
      });
      toastShownRef.current = true;
    }

    if (success) {
      router.refresh();
    }
  };

  const handlePasswordUpdated = () => {
    setIsEditDrawerOpen(false);
    router.refresh();
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{password.service}</TableCell>
      <TableCell>{password.username}</TableCell>
      <TableCell>
        <Badge variant={password.isShared ? "success" : "outline"}>
          {password.isShared ? "Compartida" : "Sin compartir"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getPasswordStrength(password.strength)}>
          {password.strength}
        </Badge>
      </TableCell>
      <TableCell>{formatRelativeTime(password.updatedAt)}</TableCell>
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
            <DropdownMenuItem onClick={handledViewDetail}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Ver detalles</span>
            </DropdownMenuItem>
            <>
              <DropdownMenuItem onClick={handleUpdatePassword}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePasswordDelete()}>
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
            currentPassword={currentPassword as PasswordModel}
            onActionComplete={() => setIsViewDrawerOpen(false)}
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
          <div className="p-4">
            <PasswordUpdateForm
              currentPassword={currentPassword as PasswordModel}
              onActionComplete={handlePasswordUpdated}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </TableRow>
  );
}
