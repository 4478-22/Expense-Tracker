import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { AuthForm } from './components/Auth/AuthForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Transactions } from './components/Transactions/Transactions';
import { RecurringTransactions } from './components/Recurring/RecurringTransactions';
import { Reminders } from './components/Reminders/Reminders';
import { Settings } from './components/Settings/Settings';

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { 
    transactions, 
    categories, 
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory
  } = useTransactions();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    if (transactionsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            categories={categories}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case 'recurring':
        return <RecurringTransactions categories={categories} />;
      case 'reminders':
        return <Reminders />;
      case 'settings':
        return (
          <Settings
            categories={categories}
            onAddCategory={addCategory}
            user={user}
          />
        );
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 ml-64">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;