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
  _id?: string
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
