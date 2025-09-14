import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Category } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert([transaction]);

    if (!error) {
      fetchTransactions();
    }
    return { error };
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (!error) {
      fetchTransactions();
    }
    return { error };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTransactions();
    }
    return { error };
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'user_id'>) => {
    const { error } = await supabase
      .from('categories')
      .insert([category]);

    if (!error) {
      fetchCategories();
    }
    return { error };
  };

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    refreshTransactions: fetchTransactions,
  };
}