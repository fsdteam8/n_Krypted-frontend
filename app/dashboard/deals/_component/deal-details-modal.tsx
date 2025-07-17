"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Deal {
  _id: string;
  title: string;
  description: string;
  participations: number;
  participationsLimit: number;
  price: number;
  location: { country: string; city: string };
  images: string[];
  offers: string[];
  status: string;
  category: Category | null;
  time: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  bookingCount?: number;
  scheduleDates?: { active: boolean; day: string; _id?: string }[];
}

interface ApiResponse {
  success: boolean;
  deal: Deal;
}

interface DealDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
}

export default function DealDetailsModal({
  open,
  onOpenChange,
  dealId,
}: DealDetailsModalProps) {
  // Fetch deal details using the dealId
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${dealId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deal details");
        }
        return await response.json();
      } catch (err) {
        console.error("Error fetching deal details:", err);
        throw err;
      }
    },
    enabled: open && !!dealId, // Only fetch when modal is open and dealId exists
  });

  const deal = response?.deal;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Deal Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Failed to load deal details. Please check the deal ID or try again later.
          </div>
        ) : deal ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{deal.title}</h2>
                <p className="text-gray-500 text-sm">ID: {deal._id}</p>
              </div>
              <Badge variant={deal.status === "activate" ? "default" : "outline"}>
                {deal.status === "activate" ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Separator />

            {deal.images && deal.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deal.images.map((image, index) => (
                  <div key={index} className="relative h-48 rounded-md overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${deal.title} image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <div
                className=" list-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: deal?.description ?? "No description available",
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Deal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Price:</span>
                      <span className="font-medium">${deal.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Location:</span>
                      <span className="font-medium">
                        {deal.location
                          ? `${deal.location.country}, ${deal.location.city}`
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Category:</span>
                      <span className="font-medium">
                        {deal.category?.categoryName || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Participations:</span>
                      <span className="font-medium">{deal.participations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Participations Limit:</span>
                      <span className="font-medium">{deal.participationsLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Time (minutes):</span>
                      <span className="font-medium">{deal.time} minutes</span>
                    </div>
                    {deal.bookingCount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-[#212121]">Booking Count:</span>
                        <span className="font-medium">{deal.bookingCount}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Dates</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Created:</span>
                      <span className="font-medium">{formatDate(deal.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#212121]">Last Updated:</span>
                      <span className="font-medium">{formatDate(deal.updatedAt)}</span>
                    </div>
                    {deal.scheduleDates && deal.scheduleDates.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[#212121]">Schedule Dates:</span>
                        <ul className="list-disc pl-5">
                          {deal.scheduleDates.map((dateObj, index) => (
                            <li key={index} className="font-medium">
                              {formatDate(dateObj.day)}{" "}
                              {dateObj.active ? (
                                <Badge variant="default" className="ml-2">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2">
                                  Inactive
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No schedule dates available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {deal.category && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category Details</h3>
                <div className="flex items-center space-x-4">
                  {deal.category.image && (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={deal.category.image || "/placeholder.svg"}
                        alt={deal.category.categoryName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{deal.category.categoryName}</p>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(deal.category.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {deal.offers && deal.offers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Offers</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {deal.offers.map((offer, index) => (
                    <li key={index} className="text-gray-700">
                      {offer}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No deal information available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}