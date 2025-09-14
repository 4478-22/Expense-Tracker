import { Transaction, MonthlyData, CategoryData } from '../types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function generateMonthlyData(transactions: Transaction[], months: number = 6): MonthlyData[] {
  const monthlyData: MonthlyData[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthTransactions = transactions.filter(transaction => 
      isWithinInterval(new Date(transaction.transaction_date), { start: monthStart, end: monthEnd })
    );
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyData.push({
      month: format(date, 'MMM yyyy'),
      income,
      expense,
      net: income - expense
    });
  }
  
  return monthlyData;
}

export function generateCategoryData(transactions: Transaction[]): CategoryData[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {};
  
  expenseTransactions.forEach(transaction => {
    if (transaction.category) {
      const categoryId = transaction.category.id;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          amount: 0,
          color: transaction.category.color,
          name: transaction.category.name
        };
      }
      categoryTotals[categoryId].amount += transaction.amount;
    }
  });
  
  return Object.values(categoryTotals).map(cat => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color
  }));
}

export function calculateStats(transactions: Transaction[]) {
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  
  const currentMonthTransactions = transactions.filter(transaction => 
    isWithinInterval(new Date(transaction.transaction_date), { 
      start: startOfMonth(currentMonth), 
      end: endOfMonth(currentMonth) 
    })
  );
  
  const lastMonthTransactions = transactions.filter(transaction => 
    isWithinInterval(new Date(transaction.transaction_date), { 
      start: startOfMonth(lastMonth), 
      end: endOfMonth(lastMonth) 
    })
  );
  
  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const lastIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const lastExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = transactions.reduce((sum, t) => 
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  );
  
  return {
    currentIncome,
    currentExpenses,
    totalBalance,
    incomeChange: lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100) : 0,
    expenseChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses * 100) : 0,
  };
}