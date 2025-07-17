"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Edit, Trash, Plus, Eye } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/dashboard/layout";
import { Pagination } from "@/components/dashboard/pagination";
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
import { toast } from "sonner";
import AddDealModal from "./_component/add-deal-modal";
import { Skeleton } from "@/components/ui/skeleton";
import DealDetailsModal from "./_component/deal-details-modal";
import EditDealModal from "./_component/edit-deal-moda";
import { useSession } from "next-auth/react";

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  _id: string;
  title: string;
  description: string;
  participations: number;
  price: number;
  location: {
    country: string;
    city: string;
  };
  images: string[];
  offers: string[];
  status: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ApiResponse {
  success: boolean;
  deals: Deal[];
  pagination: PaginationInfo;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: PaginationInfo;
}

export default function DealsManagement() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["deals", page],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/deals?showAll=true`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deals");
        }
        return await response.json();
      } catch (err) {
        console.error("Error fetching deals:", err);
        throw err;
      }
    },
  });


  // Fetch categories from API
  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error fetching categories:", err);
        throw err;
      }
    },
  });

  const categories = categoriesData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete deal");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the deals query
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted successfully", { position: "top-right" });
    },
    onError: (error) => {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete deal", { position: "top-right" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update deal status");
      }

      return response.json();
    },
    onError: (error, variables) => {
      console.error("Error updating deal status:", error);
      toast.error("Failed to update deal status", { position: "top-right" });

      // Revert the optimistic update on error
      if (data) {
        queryClient.setQueryData(["deals", page], {
          ...data,
          deals: data.deals.map((deal) =>
            deal._id === variables.id
              ? {
                  ...deal,
                  status:
                    variables.newStatus === "activate"
                      ? "deactivate"
                      : "activate",
                }
              : deal
          ),
        });
      }
    },
  });

  const deals = data?.deals || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };

  const [isPending, startTransition] = useTransition();

  const [updatingStatusIds, setUpdatingStatusIds] = useState<string[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDealId, setEditDealId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setPage(page);
    });
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      // Add the deal ID to the updating list
      setUpdatingStatusIds((prev) => [...prev, id]);

      // Calculate the new status
      const newStatus =
        currentStatus === "activate" ? "deactivate" : "activate";

      // Optimistically update the UI
      if (data) {
        queryClient.setQueryData(["deals", page], {
          ...data,
          deals: data.deals.map((deal) =>
            deal._id === id ? { ...deal, status: newStatus } : deal
          ),
        });
      }

      // Call the mutation
      statusMutation.mutate(
        { id, newStatus },
        {
          onSettled: () => {
            // Remove the deal ID from the updating list when done (success or error)
            setUpdatingStatusIds((prev) =>
              prev.filter((dealId) => dealId !== id)
            );
          },
          onSuccess: () => {
            toast.success(
              `Deal ${
                newStatus === "activate" ? "activated" : "deactivated"
              } successfully`,
              {
                position: "top-right",
              }
            );
          },
        }
      );
    } catch (error) {
      console.error("Error updating deal status:", error);
      // Make sure to remove from updating list in case of error
      setUpdatingStatusIds((prev) => prev.filter((dealId) => dealId !== id));
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDealToDelete(id);
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error("Error preparing to delete deal:", error);
    }
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;

    try {
      deleteMutation.mutate(dealToDelete);
    } finally {
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Skeleton component for loading state
  const TableSkeleton = () => {
    return (
      <>
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <TableRow
              key={index}
              className="border-b border-[#BABABA] hover:bg-[#BABABA]/10"
            >
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[180px]" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[100px]" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[80px]" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[150px]" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[60px]" />
              </TableCell>
              <TableCell className="py-4">
                <Skeleton className="h-6 w-[40px] rounded-full" />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
      </>
    );
  };

  const handleViewDetails = (id: string) => {
    setSelectedDealId(id);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditDealId(id);
    setIsEditModalOpen(true);
  };

  return (
    <Layout>
      <div className="">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[40px] text-[#1F2937] font-bold tracking-tigh">
              Deals
            </CardTitle>
            <p className="text-xl text-[#595959]">Dashboard &gt; Deals</p>
          </div>

          <Button
            className="bg-[#212121] hover:bg-[#212121]/90 text-white h-[52px]"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Deal
          </Button>
        </CardHeader>
        <Card className="bg-[#FFFFFF] mt-10">
          <CardContent>
            <div className="rounded-md ">
              <Table>
                <TableHeader>
                  <TableRow className="text-[#595959] text-base font-medium py-4 hover:bg-transparent">
                    <TableHead>Deals</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>City</TableHead>

                    <TableHead>Price</TableHead>
                    <TableHead>Activate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : deals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        No deals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    deals.map((deal) => (
                      <TableRow
                        key={deal._id}
                        className="border-b border-[#BABABA] hover:bg-[#BABABA]/10"
                      >
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          {deal.title || "Lorem ipsum is a dummy or text."}
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          {deal.category?.categoryName || "Restaurants"}
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          {`#${deal._id.substring(0, 3)}-${deal._id.substring(
                            3,
                            6
                          )}` || "#212-121"}
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          {deal.location.country}
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          {deal.location.city}
                        </TableCell>

                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          ${deal.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          <div className="relative">
                            <Switch
                              checked={deal.status === "activate"}
                              onCheckedChange={() =>
                                handleStatusToggle(deal._id, deal.status)
                              }
                              disabled={updatingStatusIds.includes(deal._id)}
                            />
                            {updatingStatusIds.includes(deal._id) && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#212121] border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#212121] text-base font-medium py-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(deal._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(deal._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(deal._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 pb-2 px-3">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                isLoading={isLoading || isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this deal?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              deal from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddDealModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        categories={categories}
      />
      {selectedDealId && (
        <DealDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          dealId={selectedDealId}
        />
      )}
      {editDealId && (
        <EditDealModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          dealId={editDealId}
        />
      )}
    </Layout>
  );
}
