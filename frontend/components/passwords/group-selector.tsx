"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export default function GroupSelector() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const groups = ["Todos los grupos", "Grupo A", "Grupo B", "Grupo C"]; // Ejemplo de grupos

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    const params = new URLSearchParams(searchParams);
    if (group && group !== "Todos los grupos") {
      params.set("group", group);
    } else {
      params.delete("group");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={selectedGroup || ""} onValueChange={handleGroupChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por grupo" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectItem key={group} value={group}>
            {group}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
