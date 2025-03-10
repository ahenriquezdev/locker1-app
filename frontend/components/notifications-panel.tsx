import { useState } from "react";
import { format } from "date-fns";
import { Trash, MailOpen, Mail, Filter, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationType = "invite" | "security" | "system";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  date: Date;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "invite",
    title: "Invitación a grupo",
    message: "Has sido invitado al grupo 'Trabajo'",
    read: false,
    date: new Date(2023, 4, 20),
  },
  {
    id: 2,
    type: "invite",
    title: "Invitación aceptada",
    message: "Tu invitación al grupo 'Familia' ha sido aceptada",
    read: true,
    date: new Date(2023, 4, 19),
  },
  {
    id: 3,
    type: "security",
    title: "Alerta de seguridad",
    message: "Tu contraseña de Gmail ha sido expuesta",
    read: false,
    date: new Date(2023, 4, 18),
  },
  {
    id: 4,
    type: "system",
    title: "Recordatorio",
    message: "Actualiza tu contraseña de Amazon",
    read: true,
    date: new Date(2023, 4, 17),
  },
  {
    id: 5,
    type: "security",
    title: "Contraseña débil detectada",
    message: "Tu contraseña para Facebook es considerada débil",
    read: false,
    date: new Date(2023, 4, 16),
  },
];

export function NotificationsPanel() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleReadStatus = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif,
      ),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
    // toast({
    //   title: "Notificación eliminada",
    //   description: "La notificación ha sido eliminada exitosamente.",
    // });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    // toast({
    //   title: "Todas las notificaciones leídas",
    //   description: "Todas las notificaciones han sido marcadas como leídas.",
    // });
  };

  const filteredNotifications = notifications
    .filter((notif) => filter === "all" || notif.type === filter)
    .sort((a, b) => {
      const dateComparison =
        sortOrder === "desc"
          ? b.date.getTime() - a.date.getTime()
          : a.date.getTime() - b.date.getTime();
      return dateComparison;
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-sm bg-background border rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <span className="text-sm text-muted-foreground">
            {unreadCount} no leídas
          </span>
        </div>
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("invite")}>
                Invitaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("security")}>
                Seguridad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("system")}>
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            <ArrowDownUp className="mr-2 h-4 w-4" />
            {sortOrder === "desc" ? "Más recientes" : "Más antiguas"}
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[300px]">
        {filteredNotifications.map((notification) => (
          <div key={notification.id} className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3
                  className={`text-sm font-medium ${notification.read ? "text-muted-foreground" : ""}`}
                >
                  {notification.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(notification.date, "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReadStatus(notification.id)}
                >
                  {notification.read ? (
                    <MailOpen className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm">{notification.message}</p>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={markAllAsRead}>
          Marcar todas como leídas
        </Button>
      </div>
    </div>
  );
}
