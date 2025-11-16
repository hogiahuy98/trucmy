export type MealCategory = 'nước' | 'khô' | 'healthy' | 'nhanh' | 'khác'

export interface Dish {
  id: number
  name: string
  category: MealCategory
  emoji?: string | null
  note?: string | null
  is_favorite: boolean
  is_wishlist: boolean
  wishlist_note?: string | null
  created_at: string
  updated_at: string
}

export interface TodayMeal {
  id: number
  dish_id: number
  date: string
  created_at: string
  dish?: Dish // Joined dish data
}

export interface MealHistory {
  id: number
  dish_id: number
  date: string
  created_at: string
  dish?: Dish // Joined dish data
}

export interface MealVote {
  id: number
  dish_id: number
  user_role: 'GH' | 'TM'
  date: string
  created_at: string
  updated_at: string
  dish?: Dish // Joined dish data
}

export type UserRole = 'GH' | 'TM'

