"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar, Loader2, User } from "lucide-react"

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    dealId: string
}

// Updated interface to match the actual API response structure
interface DealResponse {
    deal: {
        _id: string
        title: string
        description: string
        price: number
        images: string[]
        participations: number
        maxParticipants: number
        discountPercentage: number
        status: string
        // Add any other fields that might come from your API
    }
}

// Fetch function updated to return the correct type
const fetchDeal = async (id: string): Promise<DealResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}`)

    if (!response.ok) {
        throw new Error(`Failed to fetch deal data: ${response.status}`)
    }

    return response.json()
}

export function BookingModal({ isOpen, onClose, dealId }: BookingModalProps) {
    const {
        data: dealData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["deal", dealId],
        queryFn: () => fetchDeal(dealId),
        enabled: isOpen && !!dealId,
        refetchOnWindowFocus: false,
    })

    // Calculate values for the summary - with proper null checks
    const subtotal = dealData?.deal?.price || 0
    // Add discount calculation with proper null checks
    const discount = dealData?.deal?.discountPercentage ? (subtotal * dealData.deal.discountPercentage) / 100 : 0
    const total = subtotal - discount

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 bg-black text-white overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold text-center">Buchungsdetails</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                            <span className="ml-2">Loading deal information...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center py-4">
                            {error instanceof Error ? error.message : "Failed to load deal information"}
                            <Button variant="outline" className="mt-2 mx-auto block" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : dealData ? (
                        <>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 rounded-lg overflow-hidden w-20 h-20">
                                    <Image
                                        src={dealData.deal.images[0] || "/placeholder.svg?height=80&width=80&query=deal image"}
                                        alt={dealData.deal.title}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{dealData.deal.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                                        <User className="w-4 h-4" />
                                        <span>{dealData.deal.description}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {dealData.deal.participations}/{dealData.deal.maxParticipants} participants
                                        </span>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">${dealData.deal.price.toFixed(2)}</div>
                            </div>

                            <Separator className="bg-gray-700" />

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Save</span>
                                    <span>${discount.toFixed(2)}</span>
                                </div>
                                <Separator className="bg-gray-700" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <RadioGroup defaultValue="stripe" className="mt-4">
                                <div className="flex items-center justify-between border border-gray-700 rounded-md p-3">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem id="stripe" value="stripe" />
                                        <Label htmlFor="stripe" className="cursor-pointer">
                                            Pay With Stripe
                                        </Label>
                                    </div>
                                    <div className="text-indigo-400 font-semibold">stripe</div>
                                </div>
                            </RadioGroup>

                            <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold mt-4">Pay now</Button>
                        </>
                    ) : (
                        <div className="text-center py-4">No deal information available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
