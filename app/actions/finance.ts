'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Categories
export async function getCategories() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function addCategory(category: any) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('categories')
    .upsert(category, {
      onConflict: 'key',
    })

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

// Expenses
export async function getExpenses() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addExpense(expense: any) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('expenses')
    .insert(expense)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

export async function updateExpense(id: number, updates: any) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

export async function deleteExpense(id: number) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

// Incomes
export async function getIncomes() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addIncome(income: any) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('incomes')
    .insert(income)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
  return data
}

export async function updateIncome(id: number, updates: any) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('incomes')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

export async function deleteIncome(id: number) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

// Stats
export async function getMonthlyStats(month: number, year: number, startDate: string, endDate: string) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .rpc('get_monthly_stats', { 
      month_val: month, 
      year_val: year,
      start_date_iso: startDate,
      end_date_iso: endDate
    })

  if (error) throw new Error(error.message)
  return data
}

// Transfers
export async function getTransfers() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addTransfer(transfer: any) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('transfers')
    .insert(transfer)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
  return data
}

export async function updateTransfer(id: number, updates: any) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('transfers')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}

export async function deleteTransfer(id: number) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('transfers')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/chi-tieu')
}
