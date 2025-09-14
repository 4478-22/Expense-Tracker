import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Transaction, Category } from '../../types';
import { exportTransactionsToCSV } from '../../utils/csvExport';

interface TransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function Transactions({ 
  transactions, 
  categories, 
  onAddTransaction, 
  onUpdateTransaction, 
  onDeleteTransaction 
}: TransactionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(undefined);
    } else {
      onAddTransaction(transactionData);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={onDeleteTransaction}
        onExportCSV={handleExportCSV}
      />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddTransaction}
        categories={categories}
        transaction={editingTransaction}
      />
    </div>
  );
}