"use client";


import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/dashboard/pagination";

// Types
interface Feedback {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  isApproved: boolean;
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

interface FeedbackApiResponse {
  success: boolean;
  meta: Meta;
  feedbacks: Feedback[];
}

const fetchFeedbacks = async (token: string, page: number, limit: number): Promise<FeedbackApiResponse> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/feedback?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

function FeedbackList() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Default items per page
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;

  const {
    data: feedbackData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedback", token, currentPage],
    queryFn: () =>
      token
        ? fetchFeedbacks(token, currentPage, limit)
        : Promise.resolve({
            success: true,
            meta: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit },
            feedbacks: [],
          }),
    enabled: !!token,
  });

  const toggleApproval = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}/approve-toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      setIsDeleteModalOpen(false);
      setFeedbackToDelete(null);
    },
  });

  const handleToggleApproval = (id: string) => {
    toggleApproval.mutate(id);
  };

  const handleDeleteClick = (feedback: Feedback) => {
    setFeedbackToDelete(feedback);
    setIsDeleteModalOpen(true);
  };

  const handleDetailsClick = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailsModalOpen(true);
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
          Please log in to view feedback
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

  const feedbacks = feedbackData?.feedbacks || [];
  const meta = feedbackData?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
  };

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Feedback List</h1>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback._id}>
                  <TableCell className="font-medium">{feedback.name}</TableCell>
                  <TableCell>{feedback.email}</TableCell>
                  <TableCell>{feedback.phoneNumber}</TableCell>
                  <TableCell>
                    <Switch
                      checked={feedback.isApproved}
                      onCheckedChange={() => handleToggleApproval(feedback._id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDetailsClick(feedback)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(feedback)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
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
                Are you sure you want to delete feedback from {feedbackToDelete?.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => feedbackToDelete && deleteFeedback.mutate(feedbackToDelete._id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Details Dialog */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedFeedback.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedFeedback.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedFeedback.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <p className="whitespace-pre-line">{selectedFeedback.message}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p>{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}

export default FeedbackList;