import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PasswordListItem from "@/components/passwords/password-list-item";
import GroupSelector from "@/components/passwords/group-selector";
import SearchBar from "@/components/passwords/search-bar";
import { getPasswords } from "@/lib/actions/passwordActions";
import { PasswordSearchParams } from "@/lib/types";

export default async function PasswordListServer({
  searchParams,
}: PasswordSearchParams) {
  const result = await getPasswords();
  const passwords = result?.data?.results ?? [];

  const filteredPasswords = passwords.filter(() => true);

  return (
    <>
      <div className="grid gap-8">
        <div className="flex items-center space-x-2">
          <SearchBar />
          <GroupSelector />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Complejidad</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPasswords.map((password) => (
              <PasswordListItem
                key={password.id}
                password={password}
                searchParams={searchParams}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
