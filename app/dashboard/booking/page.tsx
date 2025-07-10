"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { Skeleton } from "@/components/ui/skeleton"
import Layout from "@/components/dashboard/layout"
import { toast } from "sonner"

interface Booking {
  _id: string
  userId: string
  bookingId: string
  dealsId: {
    _id: string
    title: string
    description: string
    price: number
    location: string
    time?: number
  } | null
  isBooked: boolean
  notifyMe: boolean
  createdAt: string
  updatedAt: string
}

export default function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch bookings data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`)
      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }
      return response.json()
    },
  })

  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete booking")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast.success("Booking deleted successfully",{ position: "top-right" })
    },
  })

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
    setIsDeleteDialogOpen(false)
  }

  // Calculate pagination
  const bookings = data?.data || []
  const totalItems = bookings.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = bookings.slice(indexOfFirstItem, indexOfLastItem)

  // Generate page numbers for pagination
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pageNumbers.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push("ellipsis")
    }
  }

  return (
    <Layout>
      <div className=" py-6">
        <div className="mb-6">
          <h1 className="text-[40px] text-[#1F2937] font-bold tracking-tigh">Booking</h1>
          <div className="text-xl text-[#595959]">Dashboard &gt; Booking</div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Error loading bookings. Please try again.</div>
        ) : (
          <>
            <div className="rounded-md  bg-white  shadow-md">
              <Table>
                <TableHeader>
                      <TableRow className="text-[#595959] text-base font-medium py-4 hover:bg-transparent">
                    <TableHead>Booker</TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((booking: Booking) => (
                    <TableRow key={booking._id} className="border-b border-[#BABABA] hover:bg-[#BABABA]/10">
                      <TableCell className="text-[#212121] text-base font-medium py-4">
                        <div>John Smith</div>
                        <div className="text-xs text-muted-foreground">john.smith@example.com</div>
                        <div className="text-xs text-muted-foreground">+1 (555) 123-4567</div>
                      </TableCell>
                      <TableCell className="text-[#212121] text-base font-medium py-4">{booking.bookingId}</TableCell>
                      <TableCell className="text-[#212121] text-base font-medium py-4">
                        {booking.dealsId ? booking.dealsId.title : "Lorem ipsum is a dummy or text..."}
                      </TableCell>
                      <TableCell className="text-[#212121] text-base font-medium py-4">
                        {format(new Date(booking.createdAt), "yyyy-MM-dd")}
                        <div>3:00 PM</div>
                      </TableCell>
                      <TableCell className="text-[#212121] text-base font-medium py-4">${booking.dealsId ? booking.dealsId.price.toFixed(2) : "50.00"}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(booking._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} results
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {pageNumbers.map((pageNumber, index) =>
                    pageNumber === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={currentPage === pageNumber}
                          onClick={() => setCurrentPage(Number(pageNumber))}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the booking and remove the data from our
                servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
   </Layout>
  )
}
