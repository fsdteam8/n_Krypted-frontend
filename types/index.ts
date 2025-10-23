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
