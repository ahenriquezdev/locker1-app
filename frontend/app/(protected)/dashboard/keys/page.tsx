"use client";
import React, { useState } from "react";
import {
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PasswordForm } from "@/components/password-form";

export default function KeysPage() {
  function formatRelativeTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "hoy";
    if (diffInDays === 1) return "hace 1 día";
    if (diffInDays < 30) return `hace ${diffInDays} días`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return "hace 1 mes";
    return `hace ${diffInMonths} meses`;
  }

  function getComplexityStatus(complexity: number): {
    status: string;
    variant: "destructive" | "warning" | "default";
  } {
    if (complexity < 50) {
      return { status: "Débil", variant: "destructive" };
    } else if (complexity < 75) {
      return { status: "Moderada", variant: "warning" };
    } else {
      return { status: "Alta", variant: "default" };
    }
  }

  const passwordsData = {
    propias: [
      {
        id: 1,
        service: "Gmail",
        username: "usuario@gmail.com",
        password: "********",
        lastUpdated: "2023-05-15",
        isShared: false,
        complexity: 85,
      },
      {
        id: 2,
        service: "GitHub",
        username: "dev-user",
        password: "********",
        lastUpdated: "2023-05-14",
        isShared: true,
        complexity: 78,
      },
      {
        id: 3,
        service: "AWS",
        username: "admin",
        password: "********",
        lastUpdated: "2023-05-13",
        isShared: true,
        group: "Desarrollo",
        complexity: 95,
      },
      {
        id: 4,
        service: "Dropbox",
        username: "user@company.com",
        password: "********",
        lastUpdated: "2023-05-12",
        isShared: false,
        group: "Personal",
        complexity: 82,
      },
      {
        id: 5,
        service: "Slack",
        username: "workspace-user",
        password: "********",
        lastUpdated: "2023-05-11",
        isShared: true,
        group: "Comunicación",
        complexity: 67,
      },
      {
        id: 6,
        service: "LinkedIn",
        username: "professional@email.com",
        password: "********",
        lastUpdated: "2023-05-10",
        isShared: false,
        group: "Personal",
        complexity: 90,
      },
    ],
    externas: [
      {
        id: 7,
        service: "Jira",
        username: "team-member",
        password: "********",
        lastUpdated: "2023-05-09",
        sharedBy: "Equipo de Desarrollo",
        complexity: 92,
      },
      {
        id: 8,
        service: "Confluence",
        username: "docs-user",
        password: "********",
        lastUpdated: "2023-05-08",
        sharedBy: "Equipo de Desarrollo",
        complexity: 75,
      },
      {
        id: 9,
        service: "GitLab",
        username: "dev-gitlab",
        password: "********",
        lastUpdated: "2023-05-07",
        sharedBy: "DevOps Team",
        group: "Desarrollo",
        complexity: 88,
      },
      {
        id: 10,
        service: "Docker Hub",
        username: "docker-team",
        password: "********",
        lastUpdated: "2023-05-06",
        sharedBy: "DevOps Team",
        group: "Desarrollo",
        complexity: 91,
      },
    ],
  };

  const [selectedCategory, setSelectedCategory] = useState<
    "propias" | "externas"
  >("propias");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPassword, setSelectedPassword] = useState<any | null>(null);
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
  const [isNewPasswordDrawerOpen, setIsNewPasswordDrawerOpen] = useState(false);
  const [isEditPasswordDrawerOpen, setIsEditPasswordDrawerOpen] =
    useState(false);
  const itemsPerPage = 10;

  const groups = [
    "Personal",
    "Desarrollo",
    "Comunicación",
    "Marketing",
    "Recursos Humanos",
  ];

  const handleViewPassword = (password: any) => {
    setSelectedPassword(password);
    setIsPasswordDrawerOpen(true);
  };

  const handleCopyToClipboard = (text: string, type: string) => {};

  const handleDeletePassword = (id: number) => {};

  const handleCreatePassword = (data: {
    service: string;
    username: string;
    password: string;
  }) => {
    setIsNewPasswordDrawerOpen(false);
  };

  const handleEditPassword = (data: {
    service: string;
    username: string;
    password: string;
  }) => {
    setIsEditPasswordDrawerOpen(false);
  };

  const filteredPasswords = passwordsData[selectedCategory].filter(
    (password) =>
      password.service.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedGroup || password.group === selectedGroup),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPasswords.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <>
      <div className="container mx-auto space-y-8 px-4 py-8 max-w-8xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Mis Claves</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus claves propias y externas
            </p>
          </div>
          <Button onClick={() => setIsNewPasswordDrawerOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Clave
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>
                Selecciona una categoría para ver sus claves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Claves Propias</h3>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory("propias")}
                    >
                      <span>Todas las claves propias</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory("propias")}
                    >
                      <span>Sin compartir</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory("propias")}
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
                      onClick={() => setSelectedCategory("externas")}
                    >
                      <span>Compartidas por otros grupos</span>
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-9">
            <CardHeader>
              <CardTitle>
                {selectedCategory === "propias"
                  ? "Claves Propias"
                  : "Claves Externas"}
              </CardTitle>
              <CardDescription>Vista general de tus claves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select
                    value={selectedGroup || ""}
                    onValueChange={(value) => setSelectedGroup(value || null)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grupos</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Última Actualización</TableHead>
                      <TableHead>
                        {selectedCategory === "propias"
                          ? "Estado"
                          : "Propietario"}
                      </TableHead>
                      <TableHead>Complejidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((password) => (
                      <TableRow key={password.id}>
                        <TableCell className="font-medium">
                          {password.service}
                        </TableCell>
                        <TableCell>{password.username}</TableCell>
                        <TableCell>
                          {formatRelativeTime(password.lastUpdated)}
                        </TableCell>
                        <TableCell>
                          {selectedCategory === "propias" ? (
                            <Badge
                              variant={
                                password.isShared ? "secondary" : "outline"
                              }
                            >
                              {password.isShared
                                ? "Compartida"
                                : "Sin compartir"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="whitespace-nowrap"
                            >
                              {password.sharedBy}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getComplexityStatus(password.complexity).variant
                            }
                          >
                            {getComplexityStatus(password.complexity).status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewPassword(password)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver detalles</span>
                              </DropdownMenuItem>
                              {selectedCategory === "propias" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPassword(password);
                                      setIsEditPasswordDrawerOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeletePassword(password.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer
        open={isPasswordDrawerOpen}
        onOpenChange={setIsPasswordDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalles de la Clave</DrawerTitle>
            <DrawerDescription>
              Información detallada de la clave para {selectedPassword?.service}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Servicio:</span>
                <span className="font-semibold">
                  {selectedPassword?.service}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Usuario:</span>
                <div className="flex items-center gap-2">
                  <span>{selectedPassword?.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        selectedPassword?.username,
                        "Usuario",
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copiar usuario</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contraseña:</span>
                <div className="flex items-center gap-2">
                  <span>********</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        selectedPassword?.password,
                        "Contraseña",
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copiar contraseña</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Complejidad:</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={selectedPassword?.complexity}
                    className="w-[60px] h-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedPassword?.complexity}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Última Actualización:
                </span>
                <span>{formatRelativeTime(selectedPassword?.lastUpdated)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedCategory === "propias" ? "Estado:" : "Propietario:"}
                </span>
                {selectedCategory === "propias" ? (
                  <Badge
                    variant={
                      selectedPassword?.isShared ? "secondary" : "outline"
                    }
                  >
                    {selectedPassword?.isShared
                      ? "Compartida"
                      : "Sin compartir"}
                  </Badge>
                ) : (
                  <Badge variant="default" className="whitespace-nowrap">
                    {selectedPassword?.sharedBy}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isNewPasswordDrawerOpen}
        onOpenChange={setIsNewPasswordDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nueva Clave</DrawerTitle>
            <DrawerDescription>
              Ingresa los detalles para crear una nueva clave
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6">
            <PasswordForm
              onSubmit={handleCreatePassword}
              onCancel={() => setIsNewPasswordDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isEditPasswordDrawerOpen}
        onOpenChange={setIsEditPasswordDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Clave</DrawerTitle>
            <DrawerDescription>
              Modifica los detalles de la clave
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6">
            <PasswordForm
              initialData={selectedPassword}
              onSubmit={handleEditPassword}
              onCancel={() => setIsEditPasswordDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
