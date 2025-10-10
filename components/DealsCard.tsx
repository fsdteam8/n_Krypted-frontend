"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StripeCheckout from "./pyment/StripeCheckout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PayPalOverlay from "./PayPalOverlay";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface ScheduleDate {
  date: string;
  active: boolean;
  participationsLimit: number;
  bookedCount: number;
  _id: string;
}

interface Location {
  country: string;
  city: string;
}

interface DealsCardProps {
  id: string;
  title: string;
  /** NEW: 2-line short blurb if available */
  shortDescription?: string;
  /** Full rich description (HTML allowed); used as fallback if shortDescription missing */
  description: string;
  price: number;
  participations?: number;
  maxParticipants?: number;
  image?: string;
  status?: string;
  time?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  scheduleDates?: ScheduleDate[];
  location?: Location;
  timer?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function DealsCard({
  id,
  title,
  shortDescription,
  description,
  price,
  createdAt,
  updatedAt,
  image,
  status,
  time = 0,
  scheduleDates = [],
  location,
  timer,
}: DealsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "paypal" | "stripe" | null
  >(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<ScheduleDate | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [agbConsent, setAgbConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  console.log(paymentIntentId);

  const token = session?.user?.accessToken ?? "";

  // ---- Helpers for short description (2-line fallback) ----
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getTwoLineFallback = (html: string) => {
    const text = stripHtml(html);
    // We don't need exact sentence logic here—line clamp will handle the 2-line UI.
    // Still, trim to a reasonable length to avoid huge DOM nodes:
    return text.length > 220 ? `${text.slice(0, 220).trim()}…` : text;
  };

  // Content to show in the card’s short area (always plain text)
  const shortBlurb =
    (shortDescription && stripHtml(shortDescription)) ||
    getTwoLineFallback(description);

  // ---- Timer logic ----
  useEffect(() => {
    if (timer !== "on") {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      });
      return;
    }

    const timerInterval = setInterval(() => {
      const startTime = updatedAt || createdAt;
      if (!startTime) {
        clearInterval(timerInterval);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const endTime = new Date(new Date(startTime).getTime() + time * 60000);
      const now = new Date().getTime();
      const difference = endTime.getTime() - now;

      if (difference <= 0) {
        clearInterval(timerInterval);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [time, createdAt, updatedAt, timer]);

  // Default date selection
  useEffect(() => {
    const firstAvailable = getFirstAvailableDate();
    setSelectedDate(firstAvailable);
    setQuantity(1);
  }, [scheduleDates]);

  const createPaymentIntent = async () => {
    if (!bookingId) return;
    setStripeLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: session?.user?.id,
            bookingId: bookingId,
            price: price * quantity,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (error) {
      toast.error("Failed to initialize payment");
      console.error(error);
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    if (isStripeModalOpen && bookingId && !clientSecret) {
      createPaymentIntent();
    }
  }, [isStripeModalOpen, bookingId]); // eslint-disable-line

  const getFirstAvailableDate = () => {
    if (!scheduleDates || scheduleDates.length === 0) return null;
    const now = new Date();
    return (
      scheduleDates.find(
        (date) =>
          date.active &&
          new Date(date.date) > now &&
          date.bookedCount < date.participationsLimit
      ) || null
    );
  };

  const allDatesUnavailable = () => {
    if (!scheduleDates || scheduleDates.length === 0) return true;
    const now = new Date();
    return !scheduleDates.some(
      (date) =>
        date.active &&
        new Date(date.date) > now &&
        date.bookedCount < date.participationsLimit
    );
  };

  const handleBooking = async (notifyMe: boolean) => {
    if (!session?.user?.id) {
      toast.success("Bitte melde dich an, um diese Funktion zu nutzen");
      return;
    }

    const availableDate = getFirstAvailableDate();
    if (!notifyMe && status === "activate" && availableDate) {
      setSelectedDate(availableDate);
      setQuantity(1);
      setIsBookingSummaryOpen(true);
    } else {
      await bookingPayment(notifyMe);
    }
  };

  const bookingPayment = async (notifyMe = false) => {
    setIsLoading(true);
    let dateToSend: ScheduleDate | null = null;

    if (notifyMe) {
      if (scheduleDates && scheduleDates.length > 0) {
        dateToSend = scheduleDates.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date)
            ? current
            : latest;
        }, scheduleDates[0]);
      }
    } else {
      dateToSend = selectedDate || getFirstAvailableDate();
      if (!dateToSend) {
        toast.error("No available dates for booking");
        setIsLoading(false);
        return;
      }
    }

    if (!dateToSend) {
      toast.error("Could not determine a valid date for booking/notification.");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        userId: session?.user?.id,
        dealsId: id,
        notifyMe,
        scheduleDate: dateToSend.date,
        scheduleId: dateToSend._id,
        price: price * quantity,
        quantity,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.booking.notifyMe) {
          toast.success(
            "Du wirst benachrichtigt, wenn der Walk Through wieder verfügbar ist."
          );
          setIsBookingSummaryOpen(false);
          return;
        }

        setBookingId(data.booking._id);
        setIsBookingSummaryOpen(false);
        if (selectedPaymentMethod === "paypal") {
          setIsPayPalModalOpen(true);
        } else if (selectedPaymentMethod === "stripe") {
          setIsStripeModalOpen(true);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDealExpired = timeLeft.isExpired && timer === "on";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeUnit = (value: number, label: string) => (
    <div className="text-center">
      <div className="w-[35px] h-[35px] rounded-sm flex items-center justify-center">
        {value.toString().padStart(2, "0")}
      </div>
      <h1 className="text-xs">{label}</h1>
    </div>
  );

  const renderActionButton = () => {
    if (
      (isDealExpired && timer === "on") ||
      status === "deactivate" ||
      allDatesUnavailable()
    ) {
      return (
        <Button
          className="w-full bg-black text-white font-semibold mt-2 hover:bg-black/80"
          onClick={() => handleBooking(true)}
          disabled={isLoading}
        >
          {isLoading ? "Wird bearbeitet…" : "Benachrichtigt mich"}
        </Button>
      );
    }

    if (status === "activate") {
      return (
        <Button
          className="w-full bg-black text-white font-semibold mt-2 hover:bg-black/80"
          onClick={() => handleBooking(false)}
          disabled={isLoading}
        >
          {isLoading ? "Wird bearbeitet..." : "Jetzt buchen"}
        </Button>
      );
    }

    return (
      <Button
        className="w-full bg-gray-400 text-white font-semibold mt-2"
        disabled
      >
        Unavailable
      </Button>
    );
  };

  const firstAvailableDate = getFirstAvailableDate();

  return (
    <>
      <Card className="overflow-hidden border-none bg-white p-2 w-full sm:max-w-[370px] hover:shadow-[0px_0px_10px_2px_#FFFFFF] transition-shadow duration-300 h-full mx-auto">
        <Link href={`/deals/${id}`} className="no-underline">
          <div
            className="relative overflow-hidden rounded-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={title || "Deal Image"}
              width={600}
              height={400}
              className={`h-[250px] object-cover rounded-lg ${
                isHovered ? "scale-105" : "scale-100"
              } transition-transform duration-300`}
            />
            {timer === "on" && status === "activate" && !isDealExpired && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 font-semibold text-white">
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                  {formatTimeUnit(timeLeft.hours, "HR")}
                  <span>:</span>
                  {formatTimeUnit(timeLeft.minutes, "MIN")}
                  <span>:</span>
                  {formatTimeUnit(timeLeft.seconds, "SEC")}
                </div>
              </div>
            )}
          </div>

          {/* Content area with consistent heights on mobile/desktop */}
          <CardContent className="pt-4 px-1">
            <div className="space-y-2">
              {/* Title: single line, fixed min-height so rows align */}
              <h3
                className="font-bold text-lg sm:text-[18px] text-[#212121] line-clamp-1"
                style={{
                  minHeight: "28px", // keeps one-line area consistent across cards
                }}
                title={title}
              >
                {title}
              </h3>

              {/* Short description area: always 2 lines height */}
              <p
                className="text-sm sm:text-[16px] font-normal text-[#737373]"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2, // 2-line clamp
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minHeight: "40px", // ~2 lines on mobile
                  maxHeight: "40px",
                  lineHeight: "1.25rem", // tighten slightly for consistency
                }}
                title={shortBlurb}
              >
                {shortBlurb}
              </p>

              <div className="flex justify-between gap-4 mt-1">
                <div>
                  <Link href={`/deals/${id}`}>
                    <div className="flex items-center gap-1 text-black font-normal cursor-pointer text-sm sm:text-[14px]">
                      <span>Mehr anzeigen</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base">
                      {price?.toFixed(2)} EUR
                    </span>
                  </div>
                </div>

                <div className="col-span-1 flex flex-col gap-1 text-xs text-gray-600 items-end">
                  {firstAvailableDate && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(firstAvailableDate.date)}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-1 max-w-[140px] sm:max-w-[180px]">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{location.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
        <CardFooter>{renderActionButton()}</CardFooter>
      </Card>

      {/* Booking Summary Modal */}
      <Dialog
        open={isBookingSummaryOpen}
        onOpenChange={setIsBookingSummaryOpen}
      >
        <DialogContent className="p-0 max-w-md bg-[#212121] text-white border-none rounded-lg w-[95%] sm:w-full">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Buchungsübersicht
              </h2>
            </div>
            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                  {title}
                </h3>
                <Link href={`/deals/${id}`} className="space-y-3">
                  <div className="flex items-center gap-1 text-white font-normal cursor-pointer text-sm sm:text-[14px]">
                    <span>Details zum Deal</span>
                  </div>
                </Link>
                <div className="translate-y-[-5px] translate-x-[-15px]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-300 sm:space-y-0">
                    {location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>
                          {location.city}, {location.country}
                        </span>
                      </div>
                    )}
                    {scheduleDates && scheduleDates.length > 0 && (
                      <div className="flex items-center justify-center gap-2 space-y-4">
                        <Calendar className="w-3 h-3 text-gray-300" />
                        <div className="translate-y-[-7px]">
                          <select
                            value={selectedDate?._id || ""}
                            onChange={(e) => {
                              const selected = scheduleDates.find(
                                (date) => date._id === e.target.value
                              );
                              setSelectedDate(selected || null);
                              setQuantity(1);
                            }}
                            className="bg-[#2a2a2a] text-white border-none rounded p-1 text-xs sm:text-sm"
                          >
                            <option value="" disabled>
                              Datum auswählen
                            </option>
                            {scheduleDates
                              .filter(
                                (date) =>
                                  date.active &&
                                  new Date(date.date) > new Date() &&
                                  date.bookedCount < date.participationsLimit
                              )
                              .map((date) => (
                                <option key={date._id} value={date._id}>
                                  {formatDate(date.date)}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white mt-4 sm:mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white pl-4">Anzahl</span>
                      <div className="flex items-center gap-1 ml-[75px]">
                        <Button
                          onClick={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1);
                            }
                          }}
                          disabled={quantity <= 1}
                          className="w-8 h-8 bg-[#2a2a2a] text-white hover:bg-[#3f3f3f]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </Button>
                        <span className="w-12 text-center text-sm text-white">
                          {quantity}
                        </span>
                        <Button
                          onClick={() => {
                            const maxAvailable = selectedDate
                              ? selectedDate.participationsLimit -
                                selectedDate.bookedCount
                              : 1;
                            if (quantity < maxAvailable) {
                              setQuantity(quantity + 1);
                            } else {
                              toast.error(
                                `Maximum ${maxAvailable} tickets available for this date`
                              );
                            }
                          }}
                          disabled={
                            !selectedDate ||
                            quantity >=
                              selectedDate.participationsLimit -
                                selectedDate.bookedCount
                          }
                          className="w-8 h-8 bg-[#2a2a2a] text-white hover:bg-[#3f3f3f]"
                          aria-label="Increase quantity"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Gesamt (inkl. MwSt.)</span>
                <span className="text-white">
                  {(price * quantity).toFixed(2)} EUR
                </span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg cursor-pointer ${
                  selectedPaymentMethod === "paypal"
                    ? "border-gray-400 bg-gray-400/10"
                    : "border-gray-600"
                }`}
                onClick={() => setSelectedPaymentMethod("paypal")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === "paypal"
                      ? "border-gray-400"
                      : "border-gray-600"
                  } flex items-center justify-center`}
                >
                  {selectedPaymentMethod === "paypal" && (
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <span className="text-white text-sm sm:text-base">
                  Bezahlen mit PayPal
                </span>
                <div className="ml-auto">
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">
                    PayPal
                  </span>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 sm:gap-3 px-2 border rounded-lg cursor-pointer ${
                  selectedPaymentMethod === "stripe"
                    ? "border-gray-400 bg-gray-400/10"
                    : "border-gray-600"
                }`}
                onClick={() => setSelectedPaymentMethod("stripe")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === "stripe"
                      ? "border-gray-400"
                      : "border-gray-600"
                  } flex items-center justify-center`}
                >
                  {selectedPaymentMethod === "stripe" && (
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <span className="text-white flex gap-2 mt-3">
                  Bezahlen mit Stripe
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="flex space-x-1">
                      <div className="flex items-center justify-center bg-[#2a2a2a] border border-gray-600 rounded">
                        <Image
                          src="/assets/visa.png"
                          alt="Visa"
                          width={60}
                          height={30}
                          className="h-5 w-7"
                        />
                      </div>
                      <div className="flex items-center justify-center bg-[#2a2a2a] border border-gray-600 rounded">
                        <Image
                          src="/assets/maestro.png"
                          alt="Maestro"
                          width={60}
                          height={30}
                          className="h-5 w-7"
                        />
                      </div>
                      <div className="flex items-center justify-center bg-[#2a2a2a] border border-gray-600 rounded">
                        <Image
                          src="/assets/amex.png"
                          alt="American Express"
                          width={60}
                          height={30}
                          className="h-5 w-7"
                        />
                      </div>
                    </div>
                  </div>
                </span>
                <div className="ml-auto">
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">
                    Stripe
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-sm text-white pb-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-gray-400"
                  name="agbConsent"
                  checked={agbConsent}
                  onChange={(e) => setAgbConsent(e.target.checked)}
                />
                <span>
                  Ich habe die{" "}
                  <Link
                    href="/report"
                    className="underline text-gray-300 hover:text-gray-100"
                  >
                    Allgemeinen Geschäftsbedingungen
                  </Link>{" "}
                  gelesen und akzeptiere sie.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-gray-400"
                  name="privacyConsent"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                />
                <span>
                  Ich habe die{" "}
                  <Link
                    href="/refund-policies"
                    className="underline text-gray-300 hover:text-gray-100"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  zur Kenntnis genommen.
                </span>
              </label>
            </div>
            <Button
              onClick={() => bookingPayment(false)}
              disabled={
                isLoading ||
                !selectedPaymentMethod ||
                !selectedDate ||
                !agbConsent ||
                !privacyConsent
              }
              className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-2 sm:py-3 text-sm sm:text-base"
            >
              {isLoading ? "Wird bearbeitet..." : "Jetzt bezahlen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PayPal Checkout Modal */}
      {bookingId && (
        <PayPalOverlay
          open={isPayPalModalOpen}
          onClose={() => setIsPayPalModalOpen(false)}
          amount={price * quantity}
          userId={session?.user?.id ?? ""}
          bookingId={bookingId}
        />
      )}

      {/* Stripe Checkout Modal */}
      <Dialog open={isStripeModalOpen} onOpenChange={setIsStripeModalOpen}>
        <DialogContent className="w-full max-w-md">
          {stripeLoading ? (
            <div className="flex justify-center items-center h-40 sm:h-64">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : clientSecret && bookingId ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  labels: "floating",
                },
              }}
            >
              <div className="scale-y-[111%] scale-x-[113%]">
                <StripeCheckout
                  bookingId={bookingId}
                  price={price * quantity}
                />
              </div>
            </Elements>
          ) : (
            <div className="text-center p-3 sm:p-4">
              <p className="text-red-500 text-sm sm:text-base">
                Die Zahlung konnte nicht initialisiert werden. Bitte versuchen
                Sie es erneut.
              </p>
              <Button
                onClick={() => createPaymentIntent()}
                className="mt-3 sm:mt-4 bg-blue-500 hover:bg-blue-600 text-sm sm:text-base"
              >
                Wiederholen
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
