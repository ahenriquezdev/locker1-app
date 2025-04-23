"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllGroups } from "@/lib/actions/groupActions";

interface SelectOption {
  value: string;
  label: string;
}

export default function GroupSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const PLACEHOLDER_VALUE = "Choose one";
  const initialGroupParam = searchParams.get("group");
  const [selectedOptionValue, setSelectedOptionValue] = useState<string>(
    initialGroupParam || PLACEHOLDER_VALUE, // Default to our placeholder value
  );

  const [optionsList, setOptionsList] = useState<SelectOption[]>([]);

  const handleOptionChange = (value: string) => {
    setSelectedOptionValue(value);

    const params = new URLSearchParams(searchParams);

    if (value && value !== PLACEHOLDER_VALUE) {
      params.set("group", value);
    } else {
      params.delete("group");
    }
    router.push(`?${params.toString()}`);
  };

  const loadOptions = async () => {
    try {
      const groupsData = await getAllGroups();
      const defaultOption: SelectOption = {
        value: PLACEHOLDER_VALUE,
        label: "Filtrar por grupo",
      };

      let fetchedOptions: SelectOption[] = [];
      if (groupsData?.success && Array.isArray(groupsData.data?.groups)) {
        fetchedOptions = groupsData.data.groups.map((group) => ({
          value: group.id,
          label: group.name,
        }));
      }

      const combinedOptions = [defaultOption, ...fetchedOptions];
      setOptionsList(combinedOptions);
    } catch (error) {
      console.error("An error occurred while fetching groups:", error);
      setOptionsList([{ value: PLACEHOLDER_VALUE, label: "Select one" }]);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (optionsList.length > 0 && initialGroupParam) {
      const paramExistsInOptions = optionsList.some(
        (option) => option.value === initialGroupParam,
      );
      if (paramExistsInOptions) {
        setSelectedOptionValue(initialGroupParam);
      } else {
        setSelectedOptionValue(PLACEHOLDER_VALUE);
        const params = new URLSearchParams(searchParams);
        params.delete("group");
        router.replace(`?${params.toString()}`);
      }
    }
  }, [optionsList, initialGroupParam, searchParams, router]);

  return (
    <Select
      value={selectedOptionValue}
      onValueChange={handleOptionChange}
      disabled={optionsList.length <= 1}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por grupo" />
      </SelectTrigger>
      <SelectContent>
        {optionsList.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
