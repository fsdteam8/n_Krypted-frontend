import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService, type ApiResponse } from "@/lib/api-service";
import { toast } from "sonner";

// Generic query hook creator to simplify implementation
function createQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<ApiResponse<T>>,
  options = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Generic mutation hook creator
function createMutation<T, V>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: {
    onSuccessMessage?: string;
    onErrorMessage?: string;
    invalidateQueries?: string[][];
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      if (options.onSuccessMessage) {
        toast.success(options.onSuccessMessage);
      }
    },
    onError: (error) => {
      console.error("API Error:", error);
      toast.error(options.onErrorMessage || "An error occurred");
    },
  });
}

// User Profile
export function useUserProfile(id: string) {
  return createQuery(["userProfile", id], () => apiService.getUserProfile(id), {
    enabled: !!id,
  });
}

export function useUpdateUserProfile() {
  return createMutation(
    ({ id, data }: { id: string; data: FormData }) =>
      apiService.updateUserProfile(id, data),
    {
      onSuccessMessage: "Profile updated successfully",
      onErrorMessage: "Failed to update profile",
      invalidateQueries: [["userProfile"]],
    }
  );
}

export function useChangePassword() {
  return createMutation(
    ({
      id,
      data,
    }: {
      id: string;
      data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      };
    }) => apiService.changePassword(id, data),
    {
      onSuccessMessage: "Password changed successfully",
      onErrorMessage: "Failed to change password",
    }
  );
}

// About Us
export function useAboutUs() {
  return createQuery(["aboutUs"], () => apiService.getAboutUs());
}

export function useUpdateAboutUs() {
  return createMutation(
    ({ id, data }: { id: string; data: FormData }) =>
      apiService.updateAboutUs(id, data),
    {
      onSuccessMessage: "About Us updated successfully",
      onErrorMessage: "Failed to update About Us",
      invalidateQueries: [["aboutUs"]],
    }
  );
}

export function useCreateAboutUs() {
  return createMutation((data: FormData) => apiService.createAboutUs(data), {
    onSuccessMessage: "About Us created successfully",
    onErrorMessage: "Failed to create About Us",
    invalidateQueries: [["aboutUs"]],
  });
}

// Privacy Policy
export function usePolicy() {
  return createQuery(["policy"], () => apiService.getPolicy());
}

export function useUpdatePolicy() {
  return createMutation(
    ({ id, data }: { id: string; data: { text: string } }) =>
      apiService.updatePolicy(id, data),
    {
      onSuccessMessage: "Privacy Policy updated successfully",
      onErrorMessage: "Failed to update Privacy Policy",
      invalidateQueries: [["policy"]],
    }
  );
}

export function useCreatePolicy() {
  return createMutation(
    (data: { text: string }) => apiService.createPolicy(data),
    {
      onSuccessMessage: "Privacy Policy created successfully",
      onErrorMessage: "Failed to create Privacy Policy",
      invalidateQueries: [["policy"]],
    }
  );
}

// Terms & Conditions
export function useTerms() {
  return createQuery(["terms"], () => apiService.getTerms());
}

export function useUpdateTerms() {
  return createMutation(
    ({ id, data }: { id: string; data: { text: string } }) =>
      apiService.updateTerms(id, data),
    {
      onSuccessMessage: "Terms & Conditions updated successfully",
      onErrorMessage: "Failed to update Terms & Conditions",
      invalidateQueries: [["terms"]],
    }
  );
}

export function useCreateTerms() {
  return createMutation(
    (data: { text: string }) => apiService.createTerms(data),
    {
      onSuccessMessage: "Terms & Conditions created successfully",
      onErrorMessage: "Failed to create Terms & Conditions",
      invalidateQueries: [["terms"]],
    }
  );
}

// Dashboard
export function useAllAuctions() {
  return createQuery(["auctions", "all"], () => apiService.getAllAuctions());
}

export function useTopBidders() {
  return createQuery(["bidders", "top"], () => apiService.getTopBidders());
}

// Auctions
export function useActiveAuctions() {
  return createQuery(["auctions", "active"], () =>
    apiService.getActiveAuctions()
  );
}

export function usePendingAuctions() {
  return createQuery(["auctions", "pending"], () =>
    apiService.getPendingAuctions()
  );
}

export function useScheduledAuctions() {
  return createQuery(["auctions", "scheduled"], () =>
    apiService.getScheduledAuctions()
  );
}

export function useEndedAuctions() {
  return createQuery(["auctions", "ended"], () =>
    apiService.getEndedAuctions()
  );
}

export function useAcceptAuction() {
  return createMutation((id: string) => apiService.acceptAuction(id), {
    onSuccessMessage: "Auction accepted successfully",
    onErrorMessage: "Failed to accept auction",
    invalidateQueries: [
      ["auctions", "pending"],
      ["auctions", "active"],
    ],
  });
}

export function useRejectAuction() {
  return createMutation((id: string) => apiService.rejectAuction(id), {
    onSuccessMessage: "Auction rejected successfully",
    onErrorMessage: "Failed to reject auction",
    invalidateQueries: [
      ["auctions", "active"],
      ["auctions", "pending"],
    ],
  });
}

export function useDeleteAuction() {
  return createMutation((id: string) => apiService.deleteAuction(id), {
    onSuccessMessage: "Auction deleted successfully",
    onErrorMessage: "Failed to delete auction",
    invalidateQueries: [
      ["auctions", "active"],
      ["auctions", "pending"],
    ],
  });
}

// Bidders
export function useAllBidders() {
  return createQuery(["bidders", "all"], () => apiService.getAllBidders());
}

export function useDeleteBidder() {
  return createMutation((id: string) => apiService.deleteBidder(id), {
    onSuccessMessage: "Bidder deleted successfully",
    onErrorMessage: "Failed to delete bidder",
    invalidateQueries: [["bidders", "all"]],
  });
}

// Categories
export function useAllCategories() {
  return createQuery(["categories", "all"], () =>
    apiService.getAllCategories()
  );
}

export function useCreateCategory() {
  return createMutation((data: FormData) => apiService.createCategory(data), {
    onSuccessMessage: "Category created successfully",
    onErrorMessage: "Failed to create category",
    invalidateQueries: [["categories"]],
  });
}

export function useUpdateCategory() {
  return createMutation(
    ({ id, data }: { id: string; data: FormData }) =>
      apiService.updateCategory(id, data),
    {
      onSuccessMessage: "Category updated successfully",
      onErrorMessage: "Failed to update category",
      invalidateQueries: [["categories"]],
    }
  );
}

export function useDeleteCategory() {
  return createMutation((id: string) => apiService.deleteCategory(id), {
    onSuccessMessage: "Category deleted successfully",
    onErrorMessage: "Failed to delete category",
    invalidateQueries: [["categories", "all"]],
  });
}

// Blogs
export function useAllBlogs() {
  return createQuery(["blogs", "all"], () => apiService.getAllBlogs());
}

// export function useBlogDetails(id: string) {
//   return createQuery(["blogs", id], () => apiService.getBlogDetails(id), {
//     enabled: !!id,
//   });
// }

export function useCreateBlog() {
  return createMutation((data: FormData) => apiService.createBlog(data), {
    onSuccessMessage: "Blog created successfully",
    onErrorMessage: "Failed to create blog",
    invalidateQueries: [["blogs"]],
  });
}

export function useUpdateBlog() {
  return createMutation(
    ({ id, data }: { id: string; data: FormData }) =>
      apiService.updateBlog(id, data),
    {
      onSuccessMessage: "Blog updated successfully",
      onErrorMessage: "Failed to update blog",
      invalidateQueries: [["blogs"]],
    }
  );
}

export function useDeleteBlog() {
  return createMutation((id: string) => apiService.deleteBlog(id), {
    onSuccessMessage: "Blog deleted successfully",
    onErrorMessage: "Failed to delete blog",
    invalidateQueries: [["blogs"]],
  });
}

// Sellers
export function useAllSellers() {
  return createQuery(["sellers", "all"], () => apiService.getAllSellers());
}

export function useDeleteSeller() {
  return createMutation((id: string) => apiService.deleteSeller(id), {
    onSuccessMessage: "Seller deleted successfully",
    onErrorMessage: "Failed to delete seller",
    invalidateQueries: [["sellers"]],
  });
}
