export interface Category {
  _id: string
  categoryName: string
  image?: string
  createdAt?: string
  updatedAt?: string
  __v?: number
  dealCount?: number
}

export interface LocationData {
  country: string
  city: string
}

export interface ScheduleDate {
  active: boolean
  day: string
  id?: string
}

export interface Deal {
  _id: string
  title: string
  description: string
  participations: number
  participationsLimit: number
  price: number
  location: LocationData
  images: string[]
  offers: string[]
  status: string
  category: Category | string
  time: number
  createdAt: string
  updatedAt: string
  __v?: number
  bookingCount?: number
  scheduleDates: ScheduleDate[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  deal?: Deal
  message?: string
}

export interface CategoriesResponse {
  success: boolean
  data: Category[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}


export interface AuctionDetailsProps {
  auctionId: string
}

export interface Auction {
  _id: string
  title: string
  description: string
  shortDescription?: string
  price: number
  images?: string[]
  location?: {
    city: string
    country: string
  }
  status: "activate" | "deactivate"
  scheduleDates?: ScheduleDate[]
}

export interface ScheduleDate {
  date: string
  active: boolean
  participationsLimit: number
  bookedCount: number
  _id: string
}

export interface Review {
  _id: string
  dealID: string
  reviewComment: string
  ratings: number
  user?: {
    name: string
    email: string
  }
  createdAt: string
}

export interface ReviewData {
  dealID: string
  reviewComment: string
  ratings: number
}

export interface DeleteReviewData {
  reviewId: string
}

export interface EditReviewData {
  reviewId: string
  reviewComment: string
  ratings: number
}

export interface AuctionImageGalleryProps {
  images: string[] | undefined
  selectedIndex: number
  onSelect: (index: number) => void
}
