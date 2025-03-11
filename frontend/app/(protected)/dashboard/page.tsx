"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Lock,
  Share2,
  UserPlus,
  Key,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [passwordsVisible, setPasswordsVisible] = useState(false);

  const securityScore = 75;
  const recentPasswords = [
    {
      id: 1,
      service: "Gmail",
      username: "user@gmail.com",
      lastUsed: "Hace 2 horas",
      group: "Personal",
    },
    {
      id: 2,
      service: "Amazon",
      username: "user.shopping",
      lastUsed: "Hace 1 día",
      group: "Compras",
    },
    {
      id: 3,
      service: "Netflix",
      username: "user.streaming",
      lastUsed: "Hace 3 días",
      group: "Entretenimiento",
    },
  ];
  const compromisedPasswords = 3;
  const weakPasswords = 5;
  const totalPasswords = 50;
  const totalGroups = 8;
  const sharedPasswords = 15;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 max-w-8xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu centro de control de seguridad de contraseñas
          </p>
        </div>
        <Button>
          <Key className="mr-2 h-4 w-4" /> Nueva Contraseña
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntuación de Seguridad
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <Progress value={securityScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +5% desde el último mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contraseñas
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPasswords}</div>
            <p className="text-xs text-muted-foreground">
              {sharedPasswords} compartidas en {totalGroups} grupos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contraseñas en Riesgo
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compromisedPasswords + weakPasswords}
            </div>
            <p className="text-xs text-muted-foreground">
              {compromisedPasswords} comprometidas, {weakPasswords} débiles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grupos Activos
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {sharedPasswords} contraseñas compartidas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Contraseñas Recientes</CardTitle>
            <CardDescription>
              Últimas contraseñas utilizadas o actualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Último Uso</TableHead>
                  <TableHead>Grupo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPasswords.map((password) => (
                  <TableRow key={password.id}>
                    <TableCell className="font-medium">
                      {password.service}
                    </TableCell>
                    <TableCell>{password.username}</TableCell>
                    <TableCell>{password.lastUsed}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{password.group}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acciones Recomendadas</CardTitle>
            <CardDescription>
              Mejora la seguridad de tu cuenta con estas acciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Actualizar contraseñas débiles
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tienes {weakPasswords} contraseñas que necesitan ser
                    fortalecidas
                  </p>
                </div>
                <Link href="/claves?filter=weak">
                  <Button size="sm">Revisar</Button>
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Verificar contraseñas comprometidas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {compromisedPasswords} contraseñas pueden haber sido
                    expuestas
                  </p>
                </div>
                <Link href="/comprometidas">
                  <Button size="sm">Verificar</Button>
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Invitar miembros a grupos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Comparte contraseñas de forma segura con tu equipo
                  </p>
                </div>
                <Link href="/grupos">
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar
                  </Button>
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Actualizar estado de seguridad
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Última actualización: hace 3 días
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
