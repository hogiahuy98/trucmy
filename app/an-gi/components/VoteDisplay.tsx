'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { Dish, MealVote, UserRole } from '../types'

interface VoteDisplayProps {
  dishes: Dish[]
  votes: MealVote[]
  userRole: UserRole
  hasUserVoted: boolean
  onVoteClick: () => void
}

const categoryEmojis: Record<string, string> = {
  nước: '🍜',
  khô: '🍛',
  healthy: '🥗',
  nhanh: '🍳',
  khác: '✏️',
}

export default function VoteDisplay({
  dishes,
  votes,
  userRole,
  hasUserVoted,
  onVoteClick,
}: VoteDisplayProps) {
  // Get votes by dish
  const getVotesForDish = (dishId: number) => {
    return votes.filter((v) => v.dish_id === dishId)
  }

  // Check if both voted for same dish
  const ghVote = votes.find((v) => v.user_role === 'GH')
  const tmVote = votes.find((v) => v.user_role === 'TM')
  const bothVotedSame = ghVote && tmVote && ghVote.dish_id === tmVote.dish_id

  if (dishes.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.3 }}
      className="mb-5"
    >
      <div className="rounded-[20px] p-5 bg-sage">
        <h2 className="text-dark-olive font-semibold text-lg mb-4">
          Vote hôm nay
        </h2>

        {!hasUserVoted && (
          <div className="mb-4 p-4 rounded-[16px] bg-warm-linen">
            <p className="text-dark-olive text-[15px] mb-3">
              Bạn muốn ăn món nào nhất hôm nay?
            </p>
            <Button
              onClick={onVoteClick}
              className="w-full bg-avocado-green hover:bg-avocado-green/90 text-white font-medium rounded-[14px]"
            >
              Bấm để vote
            </Button>
          </div>
        )}

        {/* Dishes with votes */}
        <div className="space-y-3">
          {dishes.map((dish) => {
            const dishVotes = getVotesForDish(dish.id)
            const ghVoted = dishVotes.some((v) => v.user_role === 'GH')
            const tmVoted = dishVotes.some((v) => v.user_role === 'TM')

            return (
              <div
                key={dish.id}
                className="flex items-center gap-3 p-3 rounded-[16px] bg-warm-linen"
              >
                <span className="text-xl flex-shrink-0">
                  {dish.emoji || categoryEmojis[dish.category] || '🍽️'}
                </span>
                <span className="text-dark-olive font-medium text-[15px] flex-1">
                  {dish.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg" title="GH">
                    {ghVoted ? '❤️' : '🤍'}
                  </span>
                  <span className="text-lg" title="TM">
                    {tmVoted ? '💛' : '🤍'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Insight cards */}
        {bothVotedSame && ghVote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-[16px] bg-avocado-green/20 border border-avocado-green/30"
          >
            <p className="text-dark-olive text-[15px] text-center">
              Món này có vẻ được lòng cả hai nè ✨
            </p>
          </motion.div>
        )}

        {votes.length === 0 && (
          <div className="mt-4 p-4 rounded-[16px] bg-warm-linen">
            <p className="text-olive-grey text-[14px] text-center">
              Tụi mình chưa chọn món nào hôm nay — vote thử nha 🌱
            </p>
          </div>
        )}

        {hasUserVoted && (
          <Button
            onClick={onVoteClick}
            variant="outline"
            className="w-full mt-4 border-avocado-green text-avocado-green hover:bg-avocado-green/10 rounded-[14px]"
          >
            Đổi vote
          </Button>
        )}
      </div>
    </motion.div>
  )
}

