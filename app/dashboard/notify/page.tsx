"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Skeleton } from "@/components/ui/skeleton"
import DeleteBookingDialog from "./_component/delete-booking-dialog"
import type { Booking, BookingsResponse } from "./_component/bookings"
import Layout from "@/components/dashboard/layout"

export default function BookingsTable() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data, isLoading, refetch, isPending } = useQuery<BookingsResponse>({
    queryKey: ["bookings", page, limit],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/booked?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }
      return response.json()
    },
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleDeleteClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return

    setIsDeleteDialogOpen(false)

    // Refresh the data after deletion
    await refetch()
  }

  const renderTableSkeleton = () => {
    return (
      <div>
        <div className="rounded-md ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booker</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: limit }).map((_, index) => (
                <TableRow key={index} className="border-b border-[#BABABA] hover:bg-[#BABABA]/10">
                  <TableCell>
                    <Skeleton className="h-5 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[120px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            <Skeleton className="h-5 w-[200px]" />
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Skeleton className="h-8 w-8 rounded-md" />
              </PaginationItem>
              <PaginationItem>
                <Skeleton className="h-8 w-8 rounded-md" />
              </PaginationItem>
              <PaginationItem>
                <Skeleton className="h-8 w-8 rounded-md" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )
  }

  // Custom pagination component
  const CustomPagination = () => {
    if (!data?.pagination) return null

    const { currentPage, totalPages } = data.pagination

    // Generate page numbers to display
    const getPageNumbers = () => {
      const pages = []
      const maxPagesToShow = 5

      if (totalPages <= maxPagesToShow) {
        // Show all pages if there are few
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)

        // Calculate start and end of page range around current page
        let startPage = Math.max(2, currentPage - 1)
        let endPage = Math.min(totalPages - 1, currentPage + 1)

        // Adjust if we're near the beginning
        if (currentPage <= 3) {
          endPage = Math.min(totalPages - 1, 4)
        }

        // Adjust if we're near the end
        if (currentPage >= totalPages - 2) {
          startPage = Math.max(2, totalPages - 3)
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
          pages.push("ellipsis-start")
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
          pages.push("ellipsis-end")
        }

        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages)
        }
      }

      return pages
    }

    const pageNumbers = getPageNumbers()

    return (
      <Pagination className="">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === 1 || isLoading || isPending}
            />
          </PaginationItem>

          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === "ellipsis-start" || pageNumber === "ellipsis-end") {
              return (
                <PaginationItem className=" !bg-red-500" key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={`page-${pageNumber}`}>
                <PaginationLink
                  isActive={currentPage === pageNumber}
                  onClick={() => handlePageChange(pageNumber as number)}
                  className={isLoading || isPending ? "pointer-events-none" : ""}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === totalPages || isLoading || isPending}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <Layout>
      {isLoading ? (
        renderTableSkeleton()
      ) : (
        <div>
          <div className="flex flex-row items-center justify-between">
            <div>
              <div className="text-[40px] text-[#1F2937] font-bold tracking-tigh">Notify Me List</div>
              <p className="text-xl text-[#595959]">Dashboard &gt; Notify Me List</p>
            </div>
          </div>
          <div className=" mt-10">
            <Table className="rounded-md bg-[#FFFFFF] shadow-2xl">
              <TableHeader>
                <TableRow className="text-[#595959] text-base font-medium py-4 hover:bg-transparent">
                  <TableHead>Booker</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((booking) => (
                  <TableRow key={booking._id} className="border-b border-[#BABABA] hover:bg-[#BABABA]/10">
                    <TableCell className="text-[#212121] text-base font-medium py-4">{booking?.userId?.email}</TableCell>
                    <TableCell className="text-[#212121] text-base font-medium py-4">{booking?.dealsId?.title}</TableCell>
                    <TableCell className="text-[#212121] text-base font-medium py-4">{format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                    <TableCell className="text-[#212121] text-base font-medium py-4">
                      <div className="flex justify-end gap-2">
                        {/* <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button> */}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(booking)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground text-nowrap">
              Showing {data?.pagination.currentPage} of {data?.pagination.totalPages} pages (
              {data?.pagination.totalItems} results)
            </div>
            <CustomPagination />
          </div>

          <DeleteBookingDialog
            open={isDeleteDialogOpen}
            booking={selectedBooking}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      )}
    </Layout>
  )
}
