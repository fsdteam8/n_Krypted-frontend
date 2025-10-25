"use client";

import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Define the types for our API response
interface Location {
  country: string;
  city: string;
}

interface ScheduleDate {
  _id: string;
  active: boolean;
  bookedCount: number;
  date: string;
  participationsLimit: number;
}

interface Deal {
  _id: string;
  title: string;
  price: number;
  description: string;
  location: Location;
  status: string;
  offers: string[];
  participations: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  scheduleDates: ScheduleDate[];
  category?: string;
  time?: number;
  timer?: string;
  __v?: number;
}

type PaymentStatus = "complete" | "pending" | "failed";

interface Booking {
  _id: string;
  bookingId: string;
  dealsId: Deal;
  isBooked: boolean;
  notifyMe: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  // fields from API sample
  price?: number;
  scheduleDate?: string;
  quantity?: number;
  paymentStatus?: PaymentStatus; // <- we'll filter by this
  __v?: number;
}

interface ApiResponse {
  success: boolean;
  data: Booking[];
}

interface SingleBookingResponse {
  success: boolean;
  data: Booking;
}

export default function BookingHistoryTable() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const userId = session?.user?.id as string | undefined;

  const fetchBookings = async (): Promise<ApiResponse> => {
    if (!userId || !accessToken) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/notify-false?user=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    return response.json();
  };

  const fetchBookingById = async (
    id: string
  ): Promise<SingleBookingResponse> => {
    if (!accessToken) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch booking details");
    }
    return response.json();
  };

  // Use TanStack Query to fetch all bookings
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["bookings", userId],
    queryFn: fetchBookings,
    enabled: !!userId && !!accessToken,
  });

  // Filter: show only completed payments
  const completedBookings = useMemo(
    () =>
      data?.data.filter((b) => (b.paymentStatus ?? "pending") === "complete") ??
      [],
    [data?.data]
  );

  // Use TanStack Query to fetch a single booking
  const {
    data: bookingDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery<SingleBookingResponse>({
    queryKey: ["booking", selectedBookingId],
    queryFn: () => fetchBookingById(selectedBookingId!),
    enabled: !!selectedBookingId && isModalOpen && !!accessToken,
  });

  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM, yyyy");
  };

  // Format price function
  const formatPrice = (price: number | undefined) => {
    if (typeof price !== "number") return "€0.00";
    return `€${price.toFixed(2)}`;
  };

  // Handle view button click
  const handleViewClick = (id: string) => {
    setSelectedBookingId(id);
    setIsModalOpen(true);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full mx-auto">
        <h2 className="text-xl font-semibold text-white mb-6">
          Buchungsverlauf
        </h2>
        <div className="bg-zinc-900/60 rounded-lg overflow-hidden">
          <div className="min-w-full overflow-x-auto">
            <div className="grid grid-cols-5 bg-zinc-800 py-3 px-4">
              <div className="text-sm font-medium text-gray-300">Walk Through</div>
              <div className="text-sm font-medium text-gray-300">
                Buchungscode
              </div>
              <div className="text-sm font-medium text-gray-300">Datum</div>
              <div className="text-sm font-medium text-gray-300">Preis</div>
              <div className="text-sm font-medium text-gray-300">Details</div>
            </div>
            <div className="divide-y divide-zinc-800">
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="grid grid-cols-5 py-3 px-4">
                    <div>
                      <Skeleton className="h-4 w-32 bg-transparent " />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 bg-transparent" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 bg-transparent" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 bg-transparent" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-5 rounded-full bg-transparent" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error instanceof Error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full mx-auto">
        <h2 className="text-xl font-semibold text-white mb-6">
          Buchungsverlauf
        </h2>
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-md">
          <p className="text-red-400">
            Fehler beim Laden der Buchungen: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-full mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Buchungsverlauf
      </h2>

      {/* Empty state when no completed bookings */}
      {completedBookings.length === 0 ? (
        <div className="bg-zinc-900/60 rounded-lg p-6 text-center text-gray-300">
          Keine abgeschlossenen Buchungen vorhanden.
        </div>
      ) : (
        <>
          {/* Table for medium and large screens */}
          <div className="hidden sm:block bg-zinc-900/60 rounded-lg overflow-hidden">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead>
                  <tr className="bg-zinc-800">
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-sm font-medium text-gray-300"
                    >
                      Walk Through
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-sm font-medium text-gray-300"
                    >
                      Buchungscode
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-sm font-medium text-gray-300"
                    >
                      Datum
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-sm font-medium text-gray-300"
                    >
                      Preis
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-sm font-medium text-gray-300"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {completedBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="py-3 px-4 text-sm text-white">
                        {booking?.dealsId?.title}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        #{booking?.bookingId?.slice(-4)}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {formatDate(booking?.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {formatPrice(
                          (booking?.dealsId?.price ?? 0) *
                            (booking?.quantity ?? 1)
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        <button
                          className="text-white hover:text-gray-300 transition-colors"
                          onClick={() => handleViewClick(booking._id)}
                          aria-label={`View details `}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view */}
          <div className="sm:hidden space-y-3">
            {completedBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-zinc-900/60 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Walk Through</span>
                  <span className="text-white text-sm">
                    {booking?.dealsId?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Buchungscode</span>
                  <span className="text-white text-sm">
                    #{booking?.bookingId?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Datum</span>
                  <span className="text-white text-sm">
                    {formatDate(booking?.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Preis</span>
                  <span className="text-white text-sm">
                    {formatPrice(
                      (booking?.dealsId?.price ?? 0) * (booking?.quantity ?? 1)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Details</span>
                  <button
                    className="text-white hover:text-gray-300 transition-colors"
                    onClick={() => handleViewClick(booking._id)}
                    aria-label={`View details `}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Booking Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Buchungsdetails
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
              <Skeleton className="h-20 w-full bg-zinc-800" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
              </div>
            </div>
          ) : detailsError instanceof Error ? (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-md">
              <p className="text-red-400">
                Fehler beim Laden der Buchungsdetails: {detailsError.message}
              </p>
            </div>
          ) : bookingDetails ? (
            <div className="space-y-6 p-2">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {bookingDetails?.data?.dealsId?.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-zinc-800 text-white border-zinc-700"
                  >
                    #{bookingDetails?.data?.bookingId?.slice(-4)}
                  </Badge>
                  <Badge
                    variant={
                      bookingDetails?.data?.isBooked ? "default" : "secondary"
                    }
                    className={
                      bookingDetails?.data?.isBooked
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-700 text-white"
                    }
                  >
                    {bookingDetails.data.isBooked ? "Gebucht" : "Ausstehend"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-400">
                  Beschreibung
                </h4>
                <div
                  className="list-item list-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      bookingDetails?.data?.dealsId?.description ??
                      "Keine Beschreibung verfügbar",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-400">Preis</h4>
                  <p className="text-sm font-semibold">
                    {formatPrice(
                      (bookingDetails?.data?.dealsId?.price ?? 0) *
                        (bookingDetails?.data?.quantity ?? 1)
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-400">
                    Standort
                  </h4>
                  <p className="text-sm">
                    {bookingDetails?.data?.dealsId?.location
                      ? `${bookingDetails.data.dealsId.location.city}, ${bookingDetails.data.dealsId.location.country}`
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-400">
                    Buchungsdatum
                  </h4>
                  <p className="text-sm">
                    {formatDate(bookingDetails?.data?.createdAt)}
                  </p>
                </div>
              </div>

              {bookingDetails?.data?.dealsId?.offers?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">
                    Angebote
                  </h4>
                  <div className="bg-zinc-800/50 rounded-md p-3">
                    <ul className="list-disc list-inside space-y-1">
                      {(() => {
                        try {
                          const raw = bookingDetails?.data?.dealsId.offers[0];
                          const parsedOffers =
                            typeof raw === "string" ? JSON.parse(raw) : raw;
                          return Array.isArray(parsedOffers) ? (
                            parsedOffers.map((offer, index) => (
                              <li key={index} className="text-sm">
                                {offer}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm">
                              {bookingDetails.data.dealsId.offers[0] as string}
                            </li>
                          );
                        } catch {
                          return (
                            <li className="text-sm">
                              {bookingDetails?.data?.dealsId?.offers?.[0]}
                            </li>
                          );
                        }
                      })()}
                    </ul>
                  </div>
                </div>
              )}

              {bookingDetails?.data?.dealsId?.images?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Bilder</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {bookingDetails.data.dealsId.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        width={300}
                        height={300}
                        alt={`Deal image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-700 hover:bg-zinc-800 hover:text-white bg-white text-[black] rounded-md"
                >
                  Schließen
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
