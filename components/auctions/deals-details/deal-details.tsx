"use client";
import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Trash2, Edit2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "@/app/deals/Star-rating";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import PayPalCheckout from "@/components/PayPalCheckout";

interface AuctionDetailsProps {
  auctionId: string;
}

interface AuctionImageGalleryProps {
  images: string[] | undefined;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

interface ReviewData {
  dealID: string;
  reviewComment: string;
  ratings: number;
}

interface Review {
  _id: string;
  dealID: string;
  reviewComment: string;
  ratings: number;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DeleteReviewData {
  reviewId: string;
}

interface EditReviewData {
  reviewId: string;
  reviewComment: string;
  ratings: number;
}

interface ScheduleDate {
  date: string;
  active: boolean;
  participationsLimit: number;
  bookedCount: number;
  _id: string;
}

const AuctionImageGallery: React.FC<AuctionImageGalleryProps> = ({
  images,
  selectedIndex,
  onSelect,
}) => {
  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }
  return (
    <div className="flex flex-row md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
      {images.slice(0, 4).map((image, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`relative min-w-[70px] !w-[82px] md:!w-[70px] !h-[85px] md:h-20 rounded-md overflow-hidden border-2 transition-all ${
            selectedIndex === index
              ? "border-blue-500 shadow-md"
              : "border-transparent hover:border-gray-300"
          }`}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={`Thumbnail ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </button>
      ))}
    </div>
  );
};

export default function DealDetails({ auctionId }: AuctionDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDate | null>(
    null
  );
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const queryClient = useQueryClient();

  console.log(selectedSchedule);
  // Fetch auction details
  const {
    data: auctionData,
    isLoading: isLoadingAuction,
    error: errorAuction,
  } = useQuery({
    queryKey: ["singledeal", auctionId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${auctionId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch auction details");
      }
      return response.json();
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  // Fetch reviews for this deal
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: errorReviews,
  } = useQuery({
    queryKey: ["dealReviews", auctionId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/deal/${auctionId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reviews");
      }
      return response.json();
    },
    enabled: !!auctionId,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewData) => {
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Bewertung erfolgreich übermittelt", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] });
      setReviewComment("");
      setReviewRating(0);
      setName("");
      setEmail("");
    },
    onError: (error) => {
      toast.error(
        error.message || "Bewertung konnte nicht übermittelt werden",
        {
          position: "top-right",
        }
      );
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async ({ reviewId }: DeleteReviewData) => {
      if (!token) {
        throw new Error(
          "Authentifizierung erforderlich. Bitte melden Sie sich an."
        );
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Die Bewertung konnte nicht gelöscht werden."
        );
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Bewertung erfolgreich gelöscht", {
        position: "top-right",
      });
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] });
    },
    onError: (error) => {
      toast.error(
        error.message || "Die Bewertung konnte nicht gelöscht werden.",
        {
          position: "top-right",
        }
      );
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    },
  });

  // Edit review mutation
  const editReviewMutation = useMutation({
    mutationFn: async ({
      reviewId,
      reviewComment,
      ratings,
    }: EditReviewData) => {
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reviewComment,
            ratings,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Die Aktualisierung der Bewertung ist fehlgeschlagen."
        );
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Review updated successfully", { position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["dealReviews", auctionId] });
      setIsEditModalOpen(false);
      setReviewToEdit(null);
      setEditComment("");
      setEditRating(0);
    },
    onError: (error) => {
      toast.error(
        error.message || "Die Aktualisierung der Bewertung ist fehlgeschlagen.",
        {
          position: "top-right",
        }
      );
    },
  });

  const auction = auctionData?.deal;

  // Filter and limit schedule dates
  const today = new Date();
  const futureSchedules =
    auction?.scheduleDates
      ?.filter((schedule: ScheduleDate) => new Date(schedule.date) >= today)
      ?.slice(0, 4) || [];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error("Please give a rating", { position: "top-right" });
      return;
    }
    const reviewData: ReviewData = {
      dealID: auctionId,
      reviewComment: reviewComment,
      ratings: reviewRating,
    };
    submitReviewMutation.mutate(reviewData);
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate({ reviewId: reviewToDelete });
    }
  };

  const handleEditClick = (review: Review) => {
    setReviewToEdit(review);
    setEditRating(review.ratings);
    setEditComment(review.reviewComment);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewToEdit) return;
    if (editRating === 0) {
      toast.error("Please give a rating", { position: "top-right" });
      return;
    }
    editReviewMutation.mutate({
      reviewId: reviewToEdit._id,
      reviewComment: editComment,
      ratings: editRating,
    });
  };

  const handleBooking = async (notifyMe = false) => {
    if (!session?.data?.user?.id) {
      toast.error("Please log in to book this deal");
      return;
    }
    if (!selectedSchedule) {
      toast.error("Please select a schedule date");
      return;
    }
    setIsBookingModalOpen(true);
  };



  const confirmBooking = async () => {
    if (!session?.data?.user?.id || !selectedSchedule) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: session.data.user.id,
            dealsId: auctionId,
            scheduleId: selectedSchedule._id,
            notifyMe: auction?.status === "deactivate",
            dealId: auctionId,
            scheduleDate: selectedSchedule?.date,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBookingId(data.booking._id);
        setIsBookingModalOpen(false);
        setIsPaymentModalOpen(true);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButton = () => {
    if (auction?.status === "activate") {
      return (
        <Button
          className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[32px]"
          onClick={() => handleBooking(false)}
          disabled={isLoading || !selectedSchedule}
        >
          {isLoading ? "Processing..." : "Book now"}
        </Button>
      );
    } else if (auction?.status === "deactivate") {
      return (
        <Button
          className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[40px]"
          onClick={() => handleBooking(true)}
          disabled={isLoading || !selectedSchedule}
        >
          {isLoading ? "Processing..." : "Benachrichtige mich"}
        </Button>
      );
    } else {
      return (
        <Button
          className="w-full bg-[#FFFFFF] text-[#212121] h-[40px] md:h-[40px]"
          onClick={() => handleBooking(false)}
          disabled={isLoading || !selectedSchedule}
        >
          {isLoading ? "Processing..." : "Book now"}
        </Button>
      );
    }
  };

  if (isLoadingAuction) {
    return (
      <div className="text-center py-10 text-white">
        Loading auction details...
      </div>
    );
  }
  if (errorAuction) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading auction details
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <div className="grid grid-cols-7 gap-4 md:gap-6 lg:gap-8 col-span-6">
          <div className="col-span-7 md:col-span-1 order-2 md:order-1">
            <AuctionImageGallery
              images={auction?.images}
              selectedIndex={selectedImageIndex}
              onSelect={setSelectedImageIndex}
            />
          </div>
          <div className="col-span-7 md:col-span-6 space-y-4 order-1 md:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image
                src={
                  auction?.images?.[selectedImageIndex] || "/placeholder.svg"
                }
                alt={auction?.title || "Property image"}
                fill
                className="object-cover !h-[491px] md:!h-[391px]"
                priority
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-6 order-3">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-[30px] font-semibold text-[#FFFFFF]">
              {auction?.title || "Property Title"}
            </h1>
            <p className="text-lg md:text-xl text-[#E0E0E0] font-normal leading-[150%]">
              <div
                className="text-white truncate max-w-full list-item"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                dangerouslySetInnerHTML={{
                  __html: auction?.description ?? "Deals Description",
                }}
              />
            </p>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-lg md:text-xl text-[#E0E0E0] font-medium">
                {auction?.location.country}, {auction?.location.city}
              </span>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-semibold text-[#FFFFFF]">
                {auction?.price ? `$${auction.price.toFixed(2)}` : "$0.00"}
              </span>
            </div>
            <Tabs className="w-full">
              <TabsList className="w-full grid grid-cols-2 gap-2 bg-transparent h-full">
                {futureSchedules.map((schedule: ScheduleDate) => (
                  <TabsTrigger
                    key={schedule._id}
                    value={schedule._id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      schedule.active
                        ? "bg-gray-600 text-gray-300"
                        : "bg-blue-600 text-white"
                    } ${
                      selectedSchedule?._id === schedule._id
                        ? "ring-2 ring-blue-400"
                        : ""
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                    disabled={!schedule.active}
                  >
                    <Calendar className="w-4 h-4" />
                    {new Date(schedule.date).toLocaleDateString()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
      <div className="space-y-6 pb-[20px] md:pb-[120px]">
        <h2 className="text-[32px] text-[#FFFFFF] font-semibold">
          Customer Reviews
        </h2>
        <div>
          <p className="text-xl text-[#FFFFFF] font-medium">
            Be the first to review &quot;This Deals&quot;
          </p>
        </div>
        <div className="space-y-4 mt-6">
          {isLoadingReviews ? (
            <p className="text-white">Loading reviews...</p>
          ) : errorReviews ? (
            <p className="text-red-500">Error loading reviews</p>
          ) : reviewsData?.reviews?.length > 0 ? (
            reviewsData.reviews.map((review: Review) => (
              <div
                key={review._id}
                className="border border-[#FFFFFF33] rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-white">
                      {review.user?.name || "Anonymous"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
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
            <p className="text-white">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
        <div className="gap-2">
          <span className="text-base text-[#FFFFFF] font-medium mb-5">
            Your rating:
          </span>
          <StarRating
            rating={reviewRating}
            interactive={true}
            onRatingChange={setReviewRating}
          />
        </div>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <Textarea
            placeholder="Your review"
            className="min-h-[150px] border border-[#FFFFFF] text-[#FFFFFF] placeholder:text-white"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <Input
              className="border border-[#FFFFFF] placeholder:text-white text-white"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              className="border border-[#FFFFFF] placeholder:text-white text-white"
              placeholder="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="p-4 bg-[#FFFFFF] text-base text-[#212121] font-medium"
            type="submit"
            disabled={submitReviewMutation.isPending}
          >
            {submitReviewMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#212121] border border-[#FFFFFF33] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-[#E0E0E0]">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-[#FFFFFF] text-[#212121]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#212121] border border-[#FFFFFF33] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Edit Review
            </DialogTitle>
            <DialogDescription className="text-[#E0E0E0]">
              Update your review and rating.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="edit-rating" className="text-white">
                Rating:
              </label>
              <StarRating
                rating={editRating}
                interactive={true}
                onRatingChange={setEditRating}
              />
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
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-800 max-w-lg rounded-xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Booking Summary
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Review your booking details before proceeding to payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {auction?.title}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {auction?.location.country}, {auction?.location.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {selectedSchedule &&
                      new Date(selectedSchedule.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Spots:</span>
                  {selectedSchedule?.participationsLimit && (
                    <span className="font-medium">
                      {selectedSchedule?.participationsLimit -
                        selectedSchedule?.bookedCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${auction?.price?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsBookingModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="p-10 border-[#FFFFFF33] text-white">
          <PayPalCheckout
            amount={auction?.price || 0}
            userId={session?.data?.user?.id ?? ""}
            bookingId={bookingId ?? ""}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
