"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MapPin, Trash2, Edit2, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StarRating from "@/app/deals/Star-rating"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import PayPalCheckout from "@/components/PayPalCheckout"
import StripeCheckout from "@/components/pyment/StripeCheckout"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { formatDate } from "@/utils/time-utils"
import Link from "next/link"
import ProductImageViewer from "@/components/product-image-viewer"
import type { AuctionDetailsProps, ScheduleDate, Review, ReviewData, DeleteReviewData, EditReviewData } from "@/types"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function DealDetails({ auctionId }: AuctionDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDate | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paypal" | "stripe" | null>(null)
  const [clientSecret, setClientSecret] = useState<string>("")
  const [stripeLoading, setStripeLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [agbConsent, setAgbConsent] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)

  const session = useSession()
  const token = session?.data?.user?.accessToken
  const queryClient = useQueryClient()

  const {
    data: auctionData,
    isLoading: isLoadingAuction,
    error: errorAuction,
  } = useQuery({
    queryKey: ["singledeal", auctionId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/${auctionId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Auktionsdetails konnten nicht abgerufen werden")
      }
      return response.json()
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: errorReviews,
  } = useQuery({
    queryKey: ["dealReviews", auctionId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/deal/${auctionId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Bewertungen konnten nicht abgerufen werden")
      }
      return response.json()
    },
    enabled: !!auctionId,
  })

  const auction = auctionData?.deal

  const today = new Date()
  const availableSchedules =
    auction?.scheduleDates
      ?.filter((schedule: ScheduleDate) => {
        return (
          schedule.active && new Date(schedule.date) >= today && schedule.bookedCount < schedule.participationsLimit
        )
      })
      ?.slice(0, 4) || []

  const allSchedulesFull =
    auction?.scheduleDates?.every((schedule: ScheduleDate) => schedule.bookedCount >= schedule.participationsLimit) ||
    false

  const noSchedulesAvailable = auction?.scheduleDates?.length === 0

  useEffect(() => {
    if (availableSchedules.length > 0 && !selectedSchedule) {
      setSelectedSchedule(availableSchedules[0])
      setQuantity(1)
    }
  }, [availableSchedules])

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewData) => {
      if (!token) {
        throw new Error("Authentifizierung erforderlich. Bitte melden Sie sich an.")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Bewertung konnte nicht übermittelt werden")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Bewertung erfolgreich übermittelt", {
        position: "top-right",
      })
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] })
      setReviewComment("")
      setReviewRating(0)
      setName("")
      setEmail("")
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Bewertung konnte nicht übermittelt werden", {
        position: "top-right",
      })
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async ({ reviewId }: DeleteReviewData) => {
      if (!token) {
        throw new Error("Authentifizierung erforderlich. Bitte melden Sie sich an.")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Die Bewertung konnte nicht gelöscht werden.")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Bewertung erfolgreich gelöscht", {
        position: "top-right",
      })
      setIsDeleteModalOpen(false)
      setReviewToDelete(null)
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Die Bewertung konnte nicht gelöscht werden.", {
        position: "top-right",
      })
      setIsDeleteModalOpen(false)
      setReviewToDelete(null)
    },
  })

  const editReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reviewComment, ratings }: EditReviewData) => {
      if (!token) {
        throw new Error("Authentifizierung erforderlich. Bitte melden Sie sich an.")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewComment,
          ratings,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Die Aktualisierung der Bewertung ist fehlgeschlagen.")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Bewertung erfolgreich aktualisiert", {
        position: "top-right",
      })
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] })
      setIsEditModalOpen(false)
      setReviewToEdit(null)
      setEditComment("")
      setEditRating(0)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Die Aktualisierung der Bewertung ist fehlgeschlagen.", {
        position: "top-right",
      })
    },
  })

  const createPaymentIntent = async () => {
    if (!bookingId) return

    setStripeLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.data?.user?.id,
          bookingId: bookingId,
          price: auction?.price * quantity,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Zahlungsabsicht konnte nicht erstellt werden")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      toast.error("Initialisierung der Zahlung fehlgeschlagen")
      console.error(error)
    } finally {
      setStripeLoading(false)
    }
  }

  useEffect(() => {
    if (isPaymentModalOpen && selectedPaymentMethod === "stripe" && bookingId && !clientSecret) {
      createPaymentIntent()
    }
  }, [isPaymentModalOpen, selectedPaymentMethod, bookingId])

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewRating === 0) {
      toast.error("Please give a rating", { position: "top-right" })
      return
    }
    const reviewData: ReviewData = {
      dealID: auctionId,
      reviewComment: reviewComment,
      ratings: reviewRating,
    }
    submitReviewMutation.mutate(reviewData)
  }

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate({ reviewId: reviewToDelete })
    }
  }

  const handleEditClick = (review: Review) => {
    setReviewToEdit(review)
    setEditRating(review.ratings)
    setEditComment(review.reviewComment)
    setIsEditModalOpen(true)
  }

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewToEdit) return
    if (editRating === 0) {
      toast.error("Please give a rating", { position: "top-right" })
      return
    }
    editReviewMutation.mutate({
      reviewId: reviewToEdit._id,
      reviewComment: editComment,
      ratings: editRating,
    })
  }

  const handleBooking = async (notifyMe = false) => {
    if (!session?.data?.user?.id) {
      toast.error("Bitte melde dich an, um diese Funktion zu nutzen")
      return
    }
    if (!notifyMe && !selectedSchedule) {
      toast.error("Bitte wählen Sie ein Planungsdatum aus")
      return
    }
    setQuantity(1)
    setIsBookingModalOpen(true)
  }

  const truncateText = (text: string, maxLength = 3) => {
    if (!text) return ""
    const sentences = text.match(/[^.!?]+[.!?]+/g)
    if (!sentences) return text
    return sentences.slice(0, maxLength).join(" ").trim()
  }

  const confirmBooking = async () => {
    if (!session?.data?.user?.id || (!selectedSchedule && auction?.status !== "deactivate")) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session.data.user.id,
          dealsId: auctionId,
          scheduleId: selectedSchedule?._id,
          notifyMe: auction?.status === "deactivate" || allSchedulesFull,
          dealId: auctionId,
          scheduleDate: selectedSchedule?.date,
          price: auction?.price * quantity,
          quantity,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setBookingId(data.booking._id)
        setIsBookingModalOpen(false)
        setIsPaymentModalOpen(true)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Da ist etwas schiefgelaufen")
      }
    } catch (error) {
      toast.error("Da ist etwas schiefgelaufen: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderActionButton = () => {
    if (allSchedulesFull || noSchedulesAvailable) {
      return (
        <Button className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[40px]" onClick={() => handleBooking(true)}>
          Benachrichtigt mich
        </Button>
      )
    }

    if (auction?.status === "activate") {
      return (
        <Button
          className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[32px]"
          onClick={() => handleBooking(false)}
          disabled={isLoading || !selectedSchedule}
        >
          {isLoading ? "Wird bearbeitet..." : "Jetzt buchen"}
        </Button>
      )
    } else if (auction?.status === "deactivate") {
      return (
        <Button
          className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[40px]"
          onClick={() => handleBooking(true)}
          disabled={isLoading}
        >
          {isLoading ? "Wird bearbeitet…" : "Benachrichtigt mich"}
        </Button>
      )
    } else {
      return (
        <Button className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[40px]" disabled>
          Nicht verfügbar
        </Button>
      )
    }
  }

  if (isLoadingAuction) {
    return <div className="text-center py-10 text-white">Der Walk Through wird geladen…</div>
  }
  if (errorAuction) {
    return <div className="text-center py-10 text-red-500">Fehler beim Laden der Auktionsdetails</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <div className="col-span-12 md:col-span-6 order-1">
          <ProductImageViewer
            images={auction?.images || []}
            selectedIndex={selectedImageIndex}
            onSelect={setSelectedImageIndex}
            title={auction?.title || "Product Image"}
            showArrows
            
          />
        </div>

        <div className="col-span-12 md:col-span-6 order-2">
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl lg:text-[25px] font-semibold text-[#FFFFFF] leading-tight [overflow-wrap:anywhere]">
              {auction?.title || "Property Title"}
            </h1>

            {auction?.shortDescription ? (
              <p className="text-[14px] md:text-[16px] text-[#E0E0E0] font-normal leading-[150%]">
                {auction.shortDescription}
              </p>
            ) : (
              <div
                className="text-[14px] md:text-[16px] text-[#E0E0E0] font-normal leading-[150%] list-none"
                dangerouslySetInnerHTML={{
                  __html: truncateText(auction?.description, 3),
                }}
              />
            )}

            <div className="flex items-center gap-2 text-gray-500 -ml-[3px]">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-[14px] md:text-[16px] text-[#E0E0E0] font-medium">
                {auction?.location?.city}, {auction?.location?.country}
              </span>
            </div>

            <div>
              <div className="text-[14px] md:text-[16px] mt-[-10px] text-[#FFFFFF]">
                <span className="mr-[3px] text-[16px]">€</span>
                <div className="font-semibold inline">{auction?.price ? ` ${auction.price.toFixed(2)}` : "€0.00"}</div>
              </div>
            </div>

            {availableSchedules.length > 0 ? (
              <Tabs className="w-full">
                <TabsList className="w-full grid grid-cols-2 gap-2 bg-transparent h-full">
                  {availableSchedules.map((schedule: ScheduleDate) => (
                    <TabsTrigger
                      key={schedule._id}
                      value={schedule._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                        schedule.active ? "bg-gray-600 text-white" : "bg-blue-600 text-white"
                      } ${selectedSchedule?._id === schedule._id ? "" : ""}`}
                      onClick={() => {
                        setSelectedSchedule(schedule)
                        setQuantity(1)
                      }}
                      disabled={!schedule.active}
                    >
                      <Calendar className="w-4 h-4" />
                      {new Date(schedule.date).toLocaleDateString()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : (
              <div className="text-white py-4">
                {allSchedulesFull || noSchedulesAvailable
                  ? "Momentan sind keine Buchungszeiten für diesen Walk Through verfügbar."
                  : "Momentan sind keine Buchungszeiten für diesen Walk Through verfügbar."}
              </div>
            )}

            {renderActionButton()}
          </div>
        </div>
      </div>

      <div
        className="list-item list-none text-white"
        dangerouslySetInnerHTML={{
          __html: auction?.description ?? "Deals Description",
        }}
      />

      <div className="space-y-5 pb-[20px] md:pb-[120px] pt-[50px]">
        <h2 className="text-xl md:text-2xl lg:text-[26px] text-[#FFFFFF] font-semibold">Kundenrezensionen</h2>
        <div>
          <p className="text-xl text-[#FFFFFF] font-medium">Hinterlasse gerne dein Feedback hier!</p>
        </div>
        <div className="space-y-4 mt-6">
          {isLoadingReviews ? (
            <p className="text-white">Bewertungen werden geladen …</p>
          ) : errorReviews ? (
            <p className="text-red-500">Fehler beim Laden der Bewertungen</p>
          ) : reviewsData?.reviews?.length > 0 ? (
            reviewsData.reviews.map((review: Review) => (
              <div key={review._id} className="border border-[#FFFFFF33] rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-white">{review.user?.name || "Anonymous"}</div>
                    <div className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StarRating rating={review.ratings} interactive={false} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(review)}
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        aria-label="Edit review"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(review._id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        aria-label="Delete review"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-white">{review.reviewComment}</p>
              </div>
            ))
          ) : (
            <p className="text-white">Dein Feedback hilft uns unsere Deals besser zu gestalten.</p>
          )}
        </div>
        <div className="gap-2">
          <span className="text-base text-[#FFFFFF] font-medium mb-5">Deine Bewertung</span>
          <StarRating rating={reviewRating} interactive={true} onRatingChange={setReviewRating} />
        </div>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <Textarea
            placeholder="Deine Bewertung"
            className="min-h-[150px] border border-[#FFFFFF] text-[#FFFFFF] placeholder:text-white"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <Input
              className="border border-[#FFFFFF] placeholder:text-white text-white"
              placeholder="Gib deinen vollständigen Namen ein "
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              className="border border-[#FFFFFF] placeholder:text-white text-white"
              placeholder="Gib deine E-Mail ein"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="p-4 bg-white text-base text-[#212121] font-medium"
            type="submit"
            disabled={submitReviewMutation.isPending}
          >
            {submitReviewMutation.isPending ? "Wird gesendet..." : "Einreichen"}
          </Button>
        </form>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#212121] border border-[#FFFFFF33] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Rezension löschen</DialogTitle>
            <DialogDescription className="text-[#E0E0E0]">
              Möchtest du diese Rezension wirklich entfernen? Bitte beachte: Das kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-[#FFFFFF] text-[#212121]"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? "Löschen" : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#212121] border border-[#FFFFFF33] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Edit Review</DialogTitle>
            <DialogDescription className="text-[#E0E0E0]">Update your review and rating.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="edit-rating" className="text-white">
                Rating:
              </label>
              <StarRating rating={editRating} interactive={true} onRatingChange={setEditRating} />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-comment" className="text-white">
                Comment:
              </label>
              <Textarea
                id="edit-comment"
                placeholder="Your review"
                className="min-h-[150px] border border-[#FFFFFF] text-[#FFFFFF] placeholder:text-white"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
            </div>
            <DialogFooter className="flex gap-2 sm:justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-[#FFFFFF] text-[#212121]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={editReviewMutation.isPending}
              >
                {editReviewMutation.isPending ? "Updating..." : "Update Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="p-0 max-w-md bg-[#212121] text-white border-none">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Buchungsübersicht</h2>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={auction?.images?.[selectedImageIndex] || "/placeholder.svg"}
                  alt={auction?.title || "Auction Image"}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-semibold text-white mb-1">{auction?.title}</h3>
                <div className="translate-y-[10px] translate-x-[-15px]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-300 space-y-1 sm:space-y-0">
                    {auction?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>
                          {auction.location.city}, {auction.location.country}
                        </span>
                      </div>
                    )}
                    {selectedSchedule && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-300" />
                        <span className="text-sm text-nowrap">{formatDate(selectedSchedule.date)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-white mt-2">
                    <div className="flex items-center">
                      <span className="text-sm pl-[15px] font-semibold">Anzahl</span>
                      <div className="flex items-center gap-1 ml-[50px]">
                        <Button
                          onClick={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1)
                            }
                          }}
                          disabled={quantity <= 1}
                          className="w-8 h-8 bg-[#2a2a2a] text-white hover:bg-[#3f3f3f]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </Button>
                        <span className="w-12 text-center text-sm text-white">{quantity}</span>
                        <Button
                          onClick={() => {
                            const maxAvailable = selectedSchedule
                              ? selectedSchedule.participationsLimit - selectedSchedule.bookedCount
                              : 1
                            if (quantity < maxAvailable) {
                              setQuantity(quantity + 1)
                            } else {
                              toast.error(`Maximum ${maxAvailable} tickets available for this date`)
                            }
                          }}
                          disabled={
                            !selectedSchedule ||
                            quantity >= selectedSchedule.participationsLimit - selectedSchedule.bookedCount
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
            <div className="space-y-4 mb-6 mt-10">
              <div className="flex justify-between font-semibold">
                <span className="text-white">Gesamt (inkl. MwSt.)</span>
                <span className="text-white">{(auction?.price * quantity).toFixed(2) || "0.00"} EUR</span>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                  selectedPaymentMethod === "paypal" ? "border-gray-400 bg-gray-400/10" : "border-gray-600"
                }`}
                onClick={() => setSelectedPaymentMethod("paypal")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === "paypal" ? "border-gray-400" : "border-gray-600"
                  } flex items-center justify-center`}
                >
                  {selectedPaymentMethod === "paypal" && <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                </div>
                <span className="text-white">Bezahlen mit PayPal</span>
                <div className="ml-auto">
                  <span className="text-gray-300 font-semibold">PayPal</span>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 px-2 border rounded-lg cursor-pointer ${
                  selectedPaymentMethod === "stripe" ? "border-gray-400 bg-gray-400/10" : "border-gray-600"
                }`}
                onClick={() => setSelectedPaymentMethod("stripe")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === "stripe" ? "border-gray-400" : "border-gray-600"
                  } flex items-center justify-center`}
                >
                  {selectedPaymentMethod === "stripe" && <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                </div>
                <span className="text-white flex gap-2 mt-3">
                  Bezahlen mit Stripe
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="flex space-x-1">
                      <div className="flex items-center justify-center bg-[#2a2a2a] border border-gray-600 rounded">
                        <Image src="/assets/visa.png" alt="Visa" width={60} height={30} className="h-5 w-7" />
                      </div>
                      <div className="flex items-center justify-center bg-[#2a2a2a] border border-gray-600 rounded">
                        <Image src="/assets/maestro.png" alt="Maestro" width={60} height={30} className="h-5 w-7" />
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
                  <span className="text-gray-300 font-semibold">Stripe</span>
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
                  <Link href="/report" className="underline text-gray-300 hover:text-gray-100">
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
                  <Link href="/refund-policies" className="underline text-gray-300 hover:text-gray-100">
                    Datenschutzerklärung
                  </Link>{" "}
                  zur Kenntnis genommen.
                </span>
              </label>
            </div>
            <DialogFooter className="flex gap-3 justify-end pt-0 border-t-0">
              <Button
                onClick={confirmBooking}
                className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3"
                disabled={isLoading || !selectedPaymentMethod || !agbConsent || !privacyConsent}
              >
                {isLoading ? "Verarbeitung..." : "Weiter zur Zahlung"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="p-10 border-[#FFFFFF33] text-white">
          {selectedPaymentMethod === "paypal" && bookingId && (
            <PayPalCheckout
              amount={auction?.price * quantity || 0}
              userId={session?.data?.user?.id ?? ""}
              bookingId={bookingId}
            />
          )}
          {selectedPaymentMethod === "stripe" && (
            <>
              {stripeLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 "></div>
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
                  <div className="scale-y-[118%] scale-x-[120%]">
                    <StripeCheckout bookingId={bookingId} price={auction?.price * quantity || 0} />
                  </div>
                </Elements>
              ) : (
                <div className="text-center p-4">
                  <p className="text-red-500">Failed to initialize payment. Please try again.</p>
                  <Button onClick={() => createPaymentIntent()} className="mt-4 bg-blue-500 hover:bg-blue-600">
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
