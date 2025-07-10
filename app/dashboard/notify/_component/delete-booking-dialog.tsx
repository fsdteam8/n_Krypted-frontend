"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Booking } from "./bookings"
import { toast } from "sonner"

interface DeleteBookingDialogProps {
    open: boolean
    booking: Booking | null
    onClose: () => void
    onConfirm: () => void
}

export default function DeleteBookingDialog({ open, booking, onClose, onConfirm }: DeleteBookingDialogProps) {
    // Get the query client instance
    const queryClient = useQueryClient()

    const deleteBookingMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete booking")
            }

            return response.json()
        },
        onSuccess: () => {
            // Show success toast
            toast.success("Booking deleted successfully")

            // Invalidate and refetch bookings queries to update UI in real-time
            queryClient.invalidateQueries({ queryKey: ["bookings"] })

            // Call the onConfirm callback
            onConfirm()
        },
    })

    const handleDelete = () => {
        if (booking) {
            deleteBookingMutation.mutate(booking._id)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this booking? This action cannot be undone.
                        <div className="mt-4 p-4 bg-muted rounded-md">
                            <p>
                                <strong>Booking ID:</strong> {booking?.bookingId}
                            </p>
                            <p>
                                <strong>User:</strong> {booking?.userId?.name}
                            </p>
                            <p>
                                <strong>Deal:</strong> {booking?.dealsId?.title}
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
