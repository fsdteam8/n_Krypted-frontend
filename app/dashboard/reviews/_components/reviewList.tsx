"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/dashboard/pagination";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Deal {
  _id: string;
  title: string;
}

interface Review {
  _id: string;
  userID: User;
  dealID: Deal;
  reviewComment: string;
  ratings: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Meta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ReviewsApiResponse {
  success: boolean;
  meta: Meta;
  data: Review[];
}

const fetchReviews = async (
  token: string,
  page: number,
  limit: number
): Promise<ReviewsApiResponse> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reviews?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

function ReviewList() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Default items per page
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews", token, currentPage],
    queryFn: () =>
      token
        ? fetchReviews(token, currentPage, limit)
        : Promise.resolve({
            success: true,
            meta: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: limit,
            },
            data: [],
          }),
    enabled: !!token,
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    },
  });

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-6 text-center text-red-500">
        Please log in to view reviews
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const meta = reviewsData?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Deal Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell className="font-medium">
                  {review.userID.name}
                </TableCell>
                <TableCell>
                  <div className="line-clamp-2">{review?.reviewComment}</div>
                </TableCell>
                <TableCell>
                  <div className="line-clamp-2">{review?.dealID?.title}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(review)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {meta.totalPages > 10 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={meta.totalItems}
              itemsPerPage={meta.itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by{" "}
              {reviewToDelete?.userID.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                reviewToDelete && deleteReview.mutate(reviewToDelete._id)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ReviewList;
