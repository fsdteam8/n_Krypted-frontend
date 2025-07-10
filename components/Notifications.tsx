"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSocketContext } from "@/Provider/SocketProvider";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BellRing, Clock } from "lucide-react";

export interface Deal {
  _id: string;
  title: string;
  description: string;
  participationsLimit: number;
  price: number;
  location?: string | { country: string; city: string };
  images?: string[];
  offers?: string[];
  status?: string;
  category?:
    | string
    | {
        _id: string;
        categoryName: string;
        image: string;
        createdAt: string;
        updatedAt: string;
      };
  time?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isRead: boolean;
  type: string;
  dealId?: Deal | string;
  auction?: {
    title: string;
  };
}

const Notifications = () => {
  const { notifications, setNotifications, setNotificationCount, socket } =
    useSocketContext();
  const session = useSession();
  const userId = session?.data?.user?.id;
  const token = session?.data?.user?.accessToken;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [markingIndividual, setMarkingIndividual] = useState<string | null>(
    null
  );

  console.log(notifications);

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

      if (response.ok) {
        // Update local state to mark all notifications as read
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        localStorage.removeItem("notificationCount");
        setNotificationCount(0); // Set to 0 instead of null
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const markSingleNotificationAsRead = async (notificationId: string) => {
    if (!token || markingIndividual === notificationId) return;

    setMarkingIndividual(notificationId);
    try {
      // First update the backend via API
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

      if (response.ok) {
        // Update local state to mark this specific notification as read
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );

        // Update notification count - decrease by 1
        setNotificationCount((prev) => Math.max(0, prev - 1));

        // Also emit the socket event to mark as read
        if (socket) {
          socket.emit("mark_notification_read", notificationId);
        }
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.notifications) {
          setNotifications(data.notifications);
          // Update notification count based on unread notifications
          const unreadCount = data.notifications.filter(
            (notif: Notification) => !notif.isRead
          ).length;
          setNotificationCount(unreadCount);
        } else {
          console.error("Failed to fetch initial notifications:", data.message);
          setError(data.message || "Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching initial notifications:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
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

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080)
        return `${Math.floor(diffInMinutes / 1440)}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Unknown date";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deal_status_change":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "new_deal":
        return <BellRing className="h-4 w-4 text-green-500" />;
      default:
        return <BellRing className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get deal title - Updated to handle both API and socket data
  const getDealTitle = (notification: Notification) => {
    if (!notification.dealId) return "";

    if (typeof notification.dealId === "string") {
      return `Deal ID: ${notification.dealId}`;
    } else {
      return notification.dealId.title || "";
    }
  };

  // Helper function to get deal ID - Updated to handle both API and socket data
  const getDealId = (notification: Notification) => {
    if (!notification.dealId) return "";

    if (typeof notification.dealId === "string") {
      return notification.dealId;
    } else {
      return notification.dealId._id || "";
    }
  };

  // Helper function to get deal status for display
  const getDealStatus = (notification: Notification) => {
    if (!notification.dealId || typeof notification.dealId === "string")
      return "";
    return notification.dealId.status || "";
  };

  // Helper function to get deal location for display
  const getDealLocation = (notification: Notification) => {
    if (!notification.dealId || typeof notification.dealId === "string")
      return "";

    const location = notification.dealId.location;

    if (typeof location === "string") {
      return location;
    } else if (location && typeof location === "object") {
      // Handle object location (assuming it has country and city properties)
      return `${location.city}, ${location.country}`;
    }

    return "";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <BellRing className="h-5 w-5" />
            Error Loading Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between py-5">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Notifications
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markNotificationsAsRead}
                  disabled={markingAsRead}
                >
                  {markingAsRead ? "Marking..." : "Mark All as Read"}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellRing className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                {
                  "You'll see notifications here when there's activity on your deals."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const dealId = getDealId(notification);
                const dealTitle = getDealTitle(notification);
                const dealStatus = getDealStatus(notification);
                const dealLocation = getDealLocation(notification);

                return (
                  <div
                    key={notification._id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                      notification.isRead
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-500"
                        : "bg-white hover:bg-blue-50 border-l-[10px] border-l-blue-500 text-gray-900"
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
                                : "font-medium text-gray-900"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Show deal title if it exists */}
                          {dealTitle && !dealTitle.startsWith("Deal ID:") && (
                            <p
                              className={`text-sm mb-1 font-semibold ${
                                notification.isRead
                                  ? "text-gray-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {dealTitle}
                            </p>
                          )}

                          {/* Show deal status and location if available */}
                          <div className="flex items-center gap-2 mb-1">
                            {dealStatus && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  dealStatus === "activate"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {dealStatus}
                              </span>
                            )}
                            {dealLocation && (
                              <span className="text-xs text-gray-500">
                                📍 {dealLocation}
                              </span>
                            )}
                          </div>

                          {notification.auction && (
                            <p
                              className={`text-sm mb-2 ${
                                notification.isRead
                                  ? "text-gray-400"
                                  : "text-blue-600"
                              }`}
                            >
                              Related to: {notification.auction.title}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>

                            {!notification.isRead &&
                              markingIndividual === notification._id && (
                                <span className="text-xs text-blue-600">
                                  Marking as read...
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
                                : "font-medium text-gray-900"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {notification.auction && (
                            <p
                              className={`text-sm mb-2 ${
                                notification.isRead
                                  ? "text-gray-400"
                                  : "text-blue-600"
                              }`}
                            >
                              Related to: {notification.auction.title}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </p>

                            {!notification.isRead &&
                              markingIndividual === notification._id && (
                                <span className="text-xs text-blue-600">
                                  Marking as read...
                                </span>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
