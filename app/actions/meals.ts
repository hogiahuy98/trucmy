'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Dishes
export async function getDishes() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addDish(dish: any) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('dishes')
    .insert(dish)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/an-gi')
  return data
}

export async function updateDish(id: number, updates: any) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('dishes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/an-gi')
  return data
}

export async function deleteDish(id: number) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/an-gi')
}

// Today Meals
export async function getTodayMeals(date: string) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('today_meals')
    .select(`
      *,
      dish:dishes(*)
    `)
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addTodayMeal(dishId: number, date: string) {
  const supabase = createSupabaseServerClient()
  
  // Add to today_meals
  const { data: todayMeal, error: todayError } = await supabase
    .from('today_meals')
    .insert({ dish_id: dishId, date })
    .select()
    .single()

  if (todayError) throw new Error(todayError.message)

  // Add to history
  const { error: historyError } = await supabase
    .from('meal_history')
    .insert({
      dish_id: dishId,
      date,
    })

  if (historyError) console.error('Failed to add history:', historyError)

  revalidatePath('/an-gi')
  return todayMeal
}

export async function removeTodayMeal(id: number) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('today_meals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/an-gi')
}

// History
export async function getMealHistory(limit = 50) {
  const supabase = createSupabaseServerClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data, error } = await supabase
    .from('meal_history')
    .select(`
      *,
      dish:dishes(*)
    `)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

// Votes
export async function getMealVotes(date: string) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_votes')
    .select(`
      *,
      dish:dishes(*)
    `)
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function submitVote(voteData: any) {
  const supabase = createSupabaseServerClient()
  const { dish_id, user_role, date } = voteData

  // Check existing vote
  const { data: existingVote } = await supabase
    .from('meal_votes')
    .select('*')
    .eq('user_role', user_role)
    .eq('date', date)
    .single()

  let result
  if (existingVote) {
    const { data, error } = await supabase
      .from('meal_votes')
      .update({ dish_id, updated_at: new Date().toISOString() })
      .eq('id', existingVote.id)
      .select()
      .single()
      
    if (error) throw new Error(error.message)
    result = data
  } else {
    const { data, error } = await supabase
      .from('meal_votes')
      .insert({
        dish_id,
        user_role,
        date,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    result = data
  }

  revalidatePath('/an-gi')
  return result
}
