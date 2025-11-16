'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useMealStore } from './store'
import type { UserRole } from './types'
import TodayMealSummary from './components/TodayMealSummary'
import QuickSuggestions from './components/QuickSuggestions'
import FavoriteDishes from './components/FavoriteDishes'
import TryNewSection from './components/TryNewSection'
import RecentPicks from './components/RecentPicks'
import AddMealModal from './components/AddMealModal'
import EditTodayMenuModal from './components/EditTodayMenuModal'
import ManageDishesModal from './components/ManageDishesModal'
import UserRoleSelection from './components/UserRoleSelection'
import VoteDisplay from './components/VoteDisplay'
import VoteBottomSheet from './components/VoteBottomSheet'
import styles from './styles/meals.module.scss'

export default function MealsPage() {
  const initialize = useMealStore((s) => s.initialize)
  const cleanup = useMealStore((s) => s.cleanup)
  const setOnlineStatus = useMealStore((s) => s.setOnlineStatus)
  const isLoading = useMealStore((s) => s.isLoading)
  const dishes = useMealStore((s) => s.dishes)
  const todayMeals = useMealStore((s) => s.todayMeals)
  const addDish = useMealStore((s) => s.addDish)
  const updateDish = useMealStore((s) => s.updateDish)
  const deleteDish = useMealStore((s) => s.deleteDish)
  const addTodayMeal = useMealStore((s) => s.addTodayMeal)
  const removeTodayMeal = useMealStore((s) => s.removeTodayMeal)
  const submitVote = useMealStore((s) => s.submitVote)
  const getTodayDishes = useMealStore((s) => s.getTodayDishes)
  const getFavoriteDishes = useMealStore((s) => s.getFavoriteDishes)
  const getWishlistDishes = useMealStore((s) => s.getWishlistDishes)
  const getRecentDishes = useMealStore((s) => s.getRecentDishes)
  const getTodayVotes = useMealStore((s) => s.getTodayVotes)
  const getUserVote = useMealStore((s) => s.getUserVote)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [manageModalOpen, setManageModalOpen] = useState(false)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Load user role from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') as UserRole | null
      if (storedRole === 'GH' || storedRole === 'TM') {
        setUserRole(storedRole)
      } else {
        setShowRoleSelection(true)
      }
    }
  }, [])

  // Initialize store on mount
  useEffect(() => {
    const init = async () => {
      setHasInitialized(true)
      await initialize()
    }
    init()

    // Setup online/offline listeners
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      cleanup()
    }
  }, [initialize, setOnlineStatus, cleanup])

  // Track when initial load completes
  useEffect(() => {
    if (hasInitialized && !isLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [hasInitialized, isLoading, isInitialLoad])

  const handleAddDish = async (dish: {
    name: string
    category: 'nước' | 'khô' | 'healthy' | 'nhanh' | 'khác'
    emoji?: string
    note?: string
    is_favorite?: boolean
    is_wishlist?: boolean
    wishlist_note?: string
  }) => {
    await addDish(dish)
  }

  const handleAddTodayMeal = async (dishId: number) => {
    await addTodayMeal(dishId)
  }

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
    setShowRoleSelection(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role)
    }
  }

  const handleVoteSubmit = async (dishId: number) => {
    if (!userRole) return
    await submitVote(dishId, userRole)
  }

  const todayDishes = getTodayDishes()
  const favoriteDishes = getFavoriteDishes()
  const wishlistDishes = getWishlistDishes()
  const recentDishes = getRecentDishes(7)
  const todayVotes = getTodayVotes()
  const userVote = userRole ? getUserVote(userRole) : undefined

  // Show loading state
  if (isInitialLoad && (isLoading || !hasInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-avocado-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-olive-grey">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.mealsApp}>
      <div className={styles.mealsContainer}>
        {/* iOS Large Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={styles.iosHeader}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className={styles.iosLargeTitle}>Hôm nay ăn gì 🥑</h1>
              <p className={styles.iosSubtitle}>
                Thực đơn hằng ngày của tụi mình
              </p>
            </div>
            <button
              onClick={() => setManageModalOpen(true)}
              className="p-2 rounded-full hover:bg-warm-linen transition-colors mt-1"
              title="Quản lý món"
            >
              <Settings size={20} strokeWidth={2} className="text-dark-olive" />
            </button>
          </div>
        </motion.div>

        {/* Today Meal Summary Card */}
        <TodayMealSummary
          dishes={todayDishes}
          onAddClick={() => setAddModalOpen(true)}
          onEditClick={() => setEditModalOpen(true)}
        />

        {/* Vote Display */}
        {userRole && (
          <VoteDisplay
            dishes={todayDishes}
            votes={todayVotes}
            userRole={userRole}
            hasUserVoted={!!userVote}
            onVoteClick={() => setVoteModalOpen(true)}
          />
        )}

        {/* Quick Suggestions */}
        <QuickSuggestions
          suggestions={[...recentDishes, ...dishes].slice(0, 8)}
          onAdd={handleAddTodayMeal}
        />

        {/* Favorite Dishes */}
        {favoriteDishes.length > 0 && (
          <FavoriteDishes
            dishes={favoriteDishes}
            onAdd={handleAddTodayMeal}
          />
        )}

        {/* Try-New Section */}
        {wishlistDishes.length > 0 && (
          <TryNewSection
            dishes={wishlistDishes}
            onAdd={handleAddTodayMeal}
          />
        )}

        {/* Recent Picks */}
        {recentDishes.length > 0 && (
          <RecentPicks
            dishes={recentDishes}
            onAdd={handleAddTodayMeal}
          />
        )}

        {/* FAB */}
        <button
          className={styles.fab}
          onClick={() => setAddModalOpen(true)}
        >
          <span className={styles.fabInner}>
            <Plus size={20} strokeWidth={2} />
            Thêm món mới
          </span>
        </button>

        {/* Modals */}
        <AddMealModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddDish}
        />

        <EditTodayMenuModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          todayMeals={todayMeals}
          onRemove={removeTodayMeal}
          onAdd={handleAddTodayMeal}
          allDishes={dishes}
        />

        <ManageDishesModal
          open={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          dishes={dishes}
          onUpdate={updateDish}
          onDelete={deleteDish}
        />

        <UserRoleSelection
          open={showRoleSelection}
          onSelect={handleRoleSelect}
        />

        {userRole && (
          <VoteBottomSheet
            open={voteModalOpen}
            onClose={() => setVoteModalOpen(false)}
            dishes={todayDishes}
            userRole={userRole}
            currentVote={userVote}
            onSubmit={handleVoteSubmit}
          />
        )}

        <div className={styles.footer}>
          GH × TM — cùng nhau quản lý bữa ăn
        </div>
      </div>
    </div>
  )
}

