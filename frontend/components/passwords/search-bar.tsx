"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por servicio..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="max-w-sm"
      />
    </div>
  );
}
