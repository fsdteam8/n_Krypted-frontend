"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSocketContext } from "@/Provider/SocketProvider";
import type {
  Notification as SocketNotification,
  Deal as SocketDeal,
} from "@/Provider/SocketProvider";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BellRing,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

// ---- helpers: normalize API -> provider types (message untouched) ----
function normalizeLocation(loc: unknown): string | undefined {
  if (!loc) return undefined;
  if (typeof loc === "string") return loc.trim() || undefined;
  if (typeof loc === "object" && loc !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const country = (loc as any)?.country?.trim?.() ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const city = (loc as any)?.city?.trim?.() ?? "";
    const combined = [city, country].filter(Boolean).join(", ");
    return combined || undefined;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDeal(raw: any): SocketDeal {
  return {
    _id: String(raw?._id ?? ""),
    title: String(raw?.title ?? ""),
    description: String(raw?.description ?? ""),
    participationsLimit: Number(raw?.participationsLimit ?? 0),
    price: Number(raw?.price ?? 0),
    location: normalizeLocation(raw?.location),
    images: Array.isArray(raw?.images) ? raw.images.map(String) : undefined,
    offers: Array.isArray(raw?.offers) ? raw.offers.map(String) : undefined,
    status: raw?.status ? String(raw.status) : undefined,
    category: raw?.category,
    time: typeof raw?.time === "number" ? raw.time : undefined,
    createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
    __v: typeof raw?.__v === "number" ? raw.__v : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNotification(raw: any): SocketNotification {
  let dealId: SocketNotification["dealId"] = undefined;

  if (raw?.dealId && typeof raw.dealId === "object") {
    dealId = normalizeDeal(raw.dealId);
  } else if (typeof raw?.dealId === "string") {
    dealId = raw.dealId;
  }

  // message is passed through exactly as received
  return {
    _id: String(raw?._id ?? ""),
    message: String(raw?.message ?? ""),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
    userId: String(raw?.userId ?? ""),
    isRead: Boolean(raw?.isRead),
    type: String(raw?.type ?? ""),
    dealId,
    auction: raw?.auction
      ? { title: String(raw.auction?.title ?? "") }
      : undefined,
  };
}

// ---------------------------------------------------------------------

const Notifications = () => {
  const { notifications, setNotifications, setNotificationCount, socket } =
    useSocketContext();
  const session = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.data as any)?.user?.id as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session?.data as any)?.user?.accessToken as string | undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [markingIndividual, setMarkingIndividual] = useState<string | null>(
    null
  );

  // show ALL notifications (remove message filter)
  const allNotifications = notifications;

  // sort newest first (optional, comment out if server already sorts)
  const sortedNotifications = useMemo(
    () =>
      [...allNotifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [allNotifications]
  );

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage) || 1;
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const markNotificationsAsRead = async () => {
    if (!token || markingAsRead) return;

    setMarkingAsRead(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);

      // mark all as read locally and sync unread count
      setNotifications((prev) => {
        const next = prev.map((n) => ({ ...n, isRead: true }));
        setNotificationCount(0);
        return next;
      });

      localStorage.removeItem("notificationCount");
      toast.success("Alle Benachrichtigungen wurden als gelesen markiert.");
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      toast.error(
        "Benachrichtigungen konnten nicht als gelesen markiert werden."
      );
    } finally {
      setMarkingAsRead(false);
    }
  };

  const markSingleNotificationAsRead = async (notificationId: string) => {
    if (!token || markingIndividual === notificationId) return;

    setMarkingIndividual(notificationId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);

      setNotifications((prev) => {
        const next = prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        );
        const unread = next.filter((n) => !n.isRead).length;
        setNotificationCount(unread);
        return next;
      });

      if (socket) socket.emit("mark_notification_read", notificationId);
      toast.success("Benachrichtigung als gelesen markiert.");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      toast.error("Die Benachrichtigung konnte nicht markiert werden.");
    } finally {
      setMarkingIndividual(null);
    }
  };

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?userId=${userId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data?.notifications)) {
          // normalize EVERYTHING; do not filter by message
          const normalized: SocketNotification[] =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data.notifications as any[]).map(normalizeNotification);

          setNotifications(normalized);
          setNotificationCount(normalized.filter((n) => !n.isRead).length);
        } else {
          const msg =
            data?.message || "Abrufen der Benachrichtigungen fehlgeschlagen";
          setError(msg);
          toast.error(msg);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Es ist ein Fehler aufgetreten";
        setError(msg);
        toast.error("Benachrichtigungen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifications();
  }, [userId, token, setNotifications, setNotificationCount]);

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Gerade eben";
      if (diffInMinutes < 60) return `vor ${diffInMinutes} Min.`;
      if (diffInMinutes < 1440)
        return `vor ${Math.floor(diffInMinutes / 60)} Std.`;
      if (diffInMinutes < 10080)
        return `vor ${Math.floor(diffInMinutes / 1440)} Tg.`;

      return date.toLocaleDateString("de-DE", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Unbekanntes Datum";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deal_status_change":
        return <Clock className="h-4 w-4 text-white" />;
      case "new_deal":
        return <BellRing className="h-4 w-4 text-white" />;
      default:
        return <BellRing className="h-4 w-4 text-white" />;
    }
  };

  const getDealTitle = (notification: SocketNotification) => {
    if (!notification.dealId) return "";
    if (typeof notification.dealId === "string")
      return `Deal-ID: ${notification.dealId}`;
    return notification.dealId.title || "";
  };

  const getDealId = (notification: SocketNotification) => {
    if (!notification.dealId) return "";
    if (typeof notification.dealId === "string") return notification.dealId;
    return notification.dealId._id || "";
  };

  const getDealLocation = (notification: SocketNotification) => {
    if (!notification.dealId || typeof notification.dealId === "string")
      return "";
    return notification.dealId.location ?? "";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#212121] border-gray-700">
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                    <Skeleton className="h-3 w-1/2 bg-gray-700" />
                  </div>
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Card className="bg-[#212121] border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BellRing className="h-5 w-5" />
              Fehler beim Laden der Benachrichtigungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#212121] border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between py-5">
            <div className="text-white flex gap-3 items-center justify-center">
              <BellRing className="h-5 w-5" />
              Benachrichtigungen
            </div>
            <div className="flex items-center gap-2">
              {sortedNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markNotificationsAsRead}
                  disabled={markingAsRead}
                  className=""
                >
                  {markingAsRead
                    ? "Wird markiert..."
                    : "Alle als gelesen markieren"}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellRing className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Noch keine Benachrichtigungen
              </h3>
              <p className="text-gray-500">
                Hier erscheinen deine Benachrichtigungen, sobald welche
                vorhanden sind.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedNotifications.map((notification) => {
                const dealId = getDealId(notification);
                const dealTitle = getDealTitle(notification);
                const dealLocation = getDealLocation(notification);

                return (
                  <div
                    key={notification._id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                      notification.isRead
                        ? "bg-[#2a2a2a] hover:bg-[#333333] text-gray-500 border-gray-700"
                        : "bg-[#2a2a2a] hover:bg-[#333333] border-l-[10px] border-l-gray-500 text-white border-gray-700"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {dealId ? (
                        <Link
                          href={`/deals/${dealId}`}
                          onClick={() =>
                            !notification.isRead &&
                            markSingleNotificationAsRead(notification._id)
                          }
                          className="block cursor-pointer"
                        >
                          <p
                            className={`text-sm mb-1 ${
                              notification.isRead
                                ? "font-normal text-gray-500"
                                : "font-medium text-white"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {dealTitle && !dealTitle.startsWith("Deal-ID:") && (
                            <p
                              className={`text-sm mb-1 font-semibold ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-white"
                              }`}
                            >
                              {dealTitle}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-1">
                            {dealLocation && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {dealLocation}
                              </span>
                            )}
                          </div>

                          {notification.auction && (
                            <p
                              className={`text-sm mb-2 ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              Zugehörig zu: {notification.auction.title}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>

                            {!notification.isRead &&
                              markingIndividual === notification._id && (
                                <span className="text-xs text-gray-400">
                                  Wird als gelesen markiert...
                                </span>
                              )}
                          </div>
                        </Link>
                      ) : (
                        <div
                          onClick={() =>
                            !notification.isRead &&
                            markSingleNotificationAsRead(notification._id)
                          }
                          className="cursor-pointer"
                        >
                          <p
                            className={`text-sm mb-1 ${
                              notification.isRead
                                ? "font-normal text-gray-500"
                                : "font-medium text-white"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {notification.auction && (
                            <p
                              className={`text-sm mb-2 ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              Zugehörig zu: {notification.auction.title}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>

                            {!notification.isRead &&
                              markingIndividual === notification._id && (
                                <span className="text-xs text-gray-400">
                                  Wird als gelesen markiert...
                                </span>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sortedNotifications.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="border-gray-600  hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 p-0 ${
                            currentPage === pageNum
                              ? "bg-gray-700  border-gray-600"
                              : "border-gray-600  hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        className="w-10 h-10 p-0 border-gray-600  hover:bg-gray-700"
                      >
                        {totalPages}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="border-gray-600  hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
