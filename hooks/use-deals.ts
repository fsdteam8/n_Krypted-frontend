
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Deal, ApiResponse, CategoriesResponse } from "@/types/deal"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/categories`)
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      return response.json()
    },
  })
}

export function useDeal(dealId: string, enabled = true) {
  return useQuery<ApiResponse<Deal>>({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch deal details")
      }
      return response.json()
    },
    enabled: enabled && !!dealId,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation<Deal, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/api/deals`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to create deal")
      }

      return response.json()
    },
    onSuccess: (data: Deal) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      toast.success("Deal created successfully", { position: "top-right" })
    },
    onError: (error: Error) => {
      console.error("Error creating deal:", error)
      const errorMessage = error.message.includes("scheduleDates")
        ? "Invalid schedule dates format"
        : error.message || "Failed to create deal"
      toast.error(errorMessage, { position: "top-right" })
    },
  })
}

export function useUpdateDeal(dealId: string) {
  const queryClient = useQueryClient()

  return useMutation<Deal, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to update deal")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] })
      toast.success("Deal updated successfully", { position: "top-right" })
    },
    onError: (error: Error) => {
      console.error("Error updating deal:", error)
      const errorMessage = error.message.includes("scheduleDates")
        ? "Invalid schedule dates format"
        : "Failed to update deal"
      toast.error(errorMessage, { position: "top-right" })
    },
  })
}
