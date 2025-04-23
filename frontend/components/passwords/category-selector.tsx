"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";

export default function CategorySelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", category);
    router.push(`?${params.toString()}`);
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Claves Propias</h3>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleCategoryChange("propias")}
          >
            <span>Todas las claves propias</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleCategoryChange("sin-compartir")}
          >
            <span>Sin compartir</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleCategoryChange("compartidas")}
          >
            <span>Compartidas con grupos</span>
          </Button>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-2">Claves Externas</h3>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleCategoryChange("externas")}
          >
            <span>Compartidas por otros grupos</span>
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
