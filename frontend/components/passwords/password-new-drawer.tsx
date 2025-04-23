"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PasswordNewForm from "@/components/passwords/password-new-form";
import { useRouter } from "next/navigation";

interface PasswordNewDrawerProps {
  children: React.ReactNode;
  // onPasswordCreated?: () => void;
}

export default function PasswordNewDrawer({
  children,
}: PasswordNewDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handlePasswordCreated = () => {
    setIsOpen(false);
    router.refresh();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nueva Clave</DrawerTitle>
          <DrawerDescription>
            Ingresa los detalles para crear una nueva clave
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <PasswordNewForm onActionComplete={handlePasswordCreated} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
