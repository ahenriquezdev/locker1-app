"use client";

import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { AnimatedCounter } from "@/components/dashboard/animate-counter";
import {
  getPasswordCount,
  getLastUpdated,
} from "@/lib/actions/passwordActions";
import { getGroupCount } from "@/lib/actions/groupActions";
import { getUserSecurityScore } from "@/lib/actions/userActions";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);
  const [passwordCount, setPasswordCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [recentPasswords, setRecentPasswords] = useState([]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [userStats, passwordStats, groupStats, recentPasswordsData] =
        await Promise.all([
          getUserSecurityScore(),
          getPasswordCount(),
          getGroupCount(),
          getLastUpdated(),
        ]);

      if (userStats?.success) {
        const scoreRaw = Number(userStats?.data?.securityScore || 0);
        const score = parseFloat(scoreRaw.toFixed(2));
        setSecurityScore(score);
      }

      if (passwordStats?.success) {
        const count = Number(passwordStats?.data?.count || 0);
        setPasswordCount(count);
      }

      if (groupStats?.success) {
        const count = Number(groupStats?.data?.count || 0);
        setGroupCount(count);
      }

      if (recentPasswordsData?.success) {
        setRecentPasswords(recentPasswordsData?.data?.passwords || []);
      }
    } catch (error) {
      console.error("An error occurred loading dashboard counters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleFeatNotAvailable = () => {
    toast("Feature Unavailable", {
      description: "We're working on it! This feature will be available soon.",
    });
  };

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
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <AnimatedCounter
                  value={securityScore}
                  suffix="%"
                  decimals={2}
                />
              )}
            </div>
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
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <AnimatedCounter value={groupCount} />
              )}
            </div>
            <p className="text-xs text-muted-foreground"></p>
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
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <AnimatedCounter value={passwordCount} />
              )}
            </div>
            <p className="text-xs text-muted-foreground"></p>
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
              {isLoading ? <Skeleton className="h-8 w-12" /> : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Contraseñas Recientes</CardTitle>
            <CardDescription>Últimas contraseñas actualizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ultima actualizacion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />{" "}
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />{" "}
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />{" "}
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />{" "}
                      </TableCell>
                    </TableRow>
                  ))
                ) : recentPasswords.length > 0 ? (
                  recentPasswords.map((password) => (
                    <TableRow key={password.id}>
                      <TableCell className="font-medium">
                        {password.service}
                      </TableCell>
                      <TableCell>{password.username}</TableCell>
                      <TableCell>
                        <Badge
                          variant={password.isShared ? "success" : "outline"}
                        >
                          {password.isShared ? "Compartida" : "Sin compartir"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(password.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No hay contraseñas recientes.
                    </TableCell>
                  </TableRow>
                )}
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
                    Tienes 0 contraseñas que necesitan ser mejoradas
                  </p>
                </div>
                <Button size="sm" onClick={handleFeatNotAvailable}>
                  Revisar
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Verificar contraseñas comprometidas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    0 contraseñas pueden haber sido expuestas
                  </p>
                </div>
                <Button size="sm" onClick={handleFeatNotAvailable}>
                  Verificar
                </Button>
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
                <Button size="sm" onClick={handleFeatNotAvailable}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Actualizar estado de seguridad
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Última actualización: hace 0 días
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFeatNotAvailable}
                >
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
