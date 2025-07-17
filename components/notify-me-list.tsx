"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { DealsCard } from "./DealsCard"

interface Booking {
    participationsLimit: number | undefined
    participations: number
    price: number
    description: string
    images: string[]
    title: string
    status: string | undefined
    _id: string
    dealsId: {
        images: string[]
        participationsLimit: number | undefined
        _id: string
        title: string
        description: string
        price: number
        participations: number
        maxParticipants: number
        image: string
        status: string
    }
}

interface PaginationData {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

export default function NotifyMeList() {
    const { data: session } = useSession()
    const token = session?.user?.accessToken
    const [bookings, setBookings] = useState<Booking[]>([])
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const searchParams = useSearchParams()
    const router = useRouter()

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!session?.user?.id) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/notify-true?user=${session.user.id}&page=${page}&limit=${limit}`,
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error("Abrufen der Benachrichtigungen fehlgeschlagen")
                }

                const data = await response.json()

                if (data.success) {
                    setBookings(data.data)
                    setPagination(data.pagination)
                } else {
                    throw new Error(data.message || "Abrufen der Benachrichtigungen fehlgeschlagen")
                }
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchNotifications()
    }, [session, page, limit])

    const handlePageChange = (newPage: number) => {
        router.push(`?page=${newPage}&limit=${limit}`)
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Benachrichtigungsliste</h1>

            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Keine Benachrichtigungen gefunden.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <DealsCard
                                key={booking.dealsId?._id}
                                id={booking?.dealsId?._id}
                                status={booking.dealsId?.status}
                                title={booking.dealsId?.title}
                                image={booking.dealsId?.images?.[0] || "/assets/deals.png"}
                                description={booking.dealsId?.description}
                                price={booking.dealsId?.price}
                                participations={booking.dealsId?.participations}
                                maxParticipants={booking.dealsId?.maxParticipants}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="bg-[#3B3B3B] text-white hover:bg-[#3B3B3B] hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNumber)}
                                    className="min-w-[40px] bg-[#3B3B3B] text-white hover:bg-[#3B3B3B] hover:text-white "
                                >
                                    {pageNumber}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="bg-[#3B3B3B] text-white hover:bg-[#3B3B3B] hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
