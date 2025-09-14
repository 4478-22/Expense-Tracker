import { Transaction } from '../types';
import { format } from 'date-fns';

export function exportTransactionsToCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      format(new Date(transaction.transaction_date), 'yyyy-MM-dd'),
      `"${transaction.description}"`,
      `"${transaction.category?.name || 'No category'}"`,
      transaction.type,
      transaction.amount.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}