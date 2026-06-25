import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Supabase credentials not configured in environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Users
export const getUsers = () => api.get('/users');
export const addUser = (name, email) => api.post('/users', { name, email });
export const updateUser = (id, name, email) => api.put(`/users/${id}`, { name, email });
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Accounts
export const getAccounts = () => api.get('/accounts');
export const addAccount = (name, type, user_id) =>
  api.post('/accounts', { name, type, user_id });
export const updateAccount = (id, name, type) => api.put(`/accounts/${id}`, { name, type });
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const addCategory = (name, type, user_id) =>
  api.post('/categories', { name, type, user_id });
export const updateCategory = (id, name, type) => api.put(`/categories/${id}`, { name, type });
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Transactions
export const getTransactions = () => api.get('/transactions');
export const addTransaction = (account_id, category_id, user_id, type, amount, description, date) =>
  api.post('/transactions', { account_id, category_id, user_id, type, amount, description, date });
export const importTransactions = (user_id, csv) =>
  api.post('/transactions/import', { user_id, csv });
export const updateTransaction = (id, type, amount, description, date) =>
  api.put(`/transactions/${id}`, { type, amount, description, date });
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

// Opening Balances
export const getOpeningBalances = () => api.get('/balances');
export const addOpeningBalance = (account_id, balance, month) =>
  api.post('/balances', { account_id, balance, month });
export const getAccountBalance = (account_id, month) =>
  api.get('/balances/account-balance', { params: { account_id, month } });
