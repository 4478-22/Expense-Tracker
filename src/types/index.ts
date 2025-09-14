export interface User {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  type: 'income' | 'expense';
  transaction_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  category?: Category;
}

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  is_completed: boolean;
  user_id: string;
  created_at: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}