"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import useAxios from "@/hooks/useAxios"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { DealsCard } from "@/components/DealsCard"
import { DealsSkeleton } from "@/components/delas_skleton"


interface Deal {
  time: number | undefined
  bookingCount: number
  participationsLimit: number | undefined
  _id: string
  title: string
  description: string
  participations: number
  price: number
  location: string
  images: string[]
  offers: string[]
  status: string
  category: string
  createdAt: string
  updatedAt: string
}

export function DealsSection() {
  const axiosInstance = useAxios()

  const { data: response, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/deals`)
      return data
    },
  })

  const dealsData = response?.deals || []

  

  // Determine number of items to show based on screen size
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Create an array of skeleton items based on itemsPerView
  const skeletonItems = Array.from({ length: itemsPerView }, (_, index) => index)

  return (
    <section className="">
      <div className="container">
        <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-8">
          <div className="mb-4 sm:mb-0 space-y-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-3 sm:w-5 h-6 sm:h-9 bg-white rounded" />
              <div>
                <h1 className="text-[40px] font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]">
                  Popular
                </h1>
              </div>
            </div>
            <p className="text-xl md:text-2xl lg:text-[30px] font-bold text-white mt-1 md:mt-2">Unsere beliebten Deals</p>
          </div>

          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              size="icon"
              variant="outline"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
              id="carousel-prev-button"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
              id="carousel-next-button"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
            </Button>
          </div>
        </div>

        <div className="relative px-0 sm:px-4">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
            setApi={(api) => {
              if (api) {
                const prevButton = document.getElementById("carousel-prev-button")
                const nextButton = document.getElementById("carousel-next-button")

                if (prevButton) {
                  prevButton.addEventListener("click", () => api.scrollPrev())
                }

                if (nextButton) {
                  nextButton.addEventListener("click", () => api.scrollNext())
                }
              }
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {isLoading ? (
                // Skeleton loading state
                skeletonItems.map((index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className={`pl-2 md:pl-4 ${itemsPerView === 1 ? "basis-full" : itemsPerView === 2 ? "basis-1/2" : "basis-1/3"
                      }`}
                  >
                    <div className="p-1">
                      <DealsSkeleton />
                    </div>
                  </CarouselItem>
                ))
              ) : dealsData.length === 0 ? (
                <CarouselItem className="basis-full pl-2 md:pl-4">
                  <div className="flex justify-center items-center h-40 sm:h-64">
                    <p className="text-white text-center text-sm sm:text-base">No deals available at the moment.</p>
                  </div>
                </CarouselItem>
              ) : (
                // Actual data
                dealsData.map((deal: Deal) => (
                  <CarouselItem
                    key={deal._id}
                    className={` ${itemsPerView === 1 ? "basis-full" : itemsPerView === 1 ? "basis-1/2" : "basis-1/3"
                      }`}
                  >
                    <div className="p-1">
                      <DealsCard
                        id={deal._id}
                        status={deal.status}
                        title={deal.title}
                        image={deal.images[0] || "/assets/deals.png"}
                        description={deal.description}
                        price={deal.price}
                        time ={deal.time}
                        createdAt={deal.createdAt}
                        updatedAt={deal.updatedAt}
                        participations={deal.bookingCount}
                        maxParticipants={deal.participationsLimit}
                        scheduleDates={deal.scheduleDates}
                        location={deal.location}
                      />
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <div className="hidden">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
