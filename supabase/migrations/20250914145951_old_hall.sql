/*
# Expense Tracker Database Schema

1. New Tables
  - `categories`
    - `id` (uuid, primary key)
    - `name` (text)
    - `type` (text) - 'income' or 'expense'
    - `color` (text) - hex color for UI
    - `user_id` (uuid, foreign key)
    - `created_at` (timestamp)
  
  - `transactions`
    - `id` (uuid, primary key)
    - `amount` (decimal)
    - `description` (text)
    - `category_id` (uuid, foreign key)
    - `type` (text) - 'income' or 'expense'
    - `transaction_date` (date)
    - `user_id` (uuid, foreign key)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  
  - `recurring_transactions`
    - `id` (uuid, primary key)
    - `amount` (decimal)
    - `description` (text)
    - `category_id` (uuid, foreign key)
    - `type` (text) - 'income' or 'expense'
    - `frequency` (text) - 'daily', 'weekly', 'monthly', 'yearly'
    - `next_due_date` (date)
    - `is_active` (boolean)
    - `user_id` (uuid, foreign key)
    - `created_at` (timestamp)
  
  - `reminders`
    - `id` (uuid, primary key)
    - `title` (text)
    - `description` (text)
    - `due_date` (date)
    - `is_completed` (boolean)
    - `user_id` (uuid, foreign key)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Ensure data isolation between users
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text DEFAULT '#6B7280',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date date NOT NULL,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring transactions"
  ON recurring_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  is_completed boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, type, color, user_id)
VALUES 
  ('Salary', 'income', '#10B981', auth.uid()),
  ('Freelance', 'income', '#06D6A0', auth.uid()),
  ('Food & Dining', 'expense', '#EF4444', auth.uid()),
  ('Transportation', 'expense', '#F59E0B', auth.uid()),
  ('Shopping', 'expense', '#8B5CF6', auth.uid()),
  ('Entertainment', 'expense', '#EC4899', auth.uid()),
  ('Bills & Utilities', 'expense', '#6B7280', auth.uid()),
  ('Healthcare', 'expense', '#14B8A6', auth.uid())
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for transactions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();