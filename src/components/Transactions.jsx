import React, { useState, useEffect } from 'react';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  getAccounts,
  getCategories,
  getUsers,
} from '../services/api';
import './Transactions.css';

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [account_id, setAccountId] = useState('');
  const [category_id, setCategoryId] = useState('');
  const [user_id, setUserId] = useState('');
  const [type, setType] = useState('IN');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importFeedback, setImportFeedback] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, acctRes, catRes, userRes] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getCategories(),
        getUsers(),
      ]);
      setTransactions(transRes.data);
      setAccounts(acctRes.data);
      setCategories(catRes.data);
      setUsers(userRes.data);
      if (userRes.data.length > 0) setUserId(userRes.data[0].id);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!account_id || !category_id || !user_id || !amount) return;

    try {
      if (editingId) {
        await updateTransaction(editingId, type, Number(amount), description, date);
        setEditingId(null);
      } else {
        await addTransaction(
          Number(account_id),
          Number(category_id),
          Number(user_id),
          type,
          Number(amount),
          description,
          date
        );
      }
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      await fetchData();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleFileChange = (event) => {
    setImportFeedback(null);
    const file = event.target.files[0];
    setCsvFile(file || null);
  };

  const handleUploadCsv = async (event) => {
    event.preventDefault();

    if (!csvFile) {
      alert('Please choose a CSV file to upload.');
      return;
    }
    if (!user_id) {
      alert('Please select a user before uploading the CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const csvText = reader.result;
      setUploading(true);
      setImportFeedback(null);
      try {
        const response = await importTransactions(Number(user_id), csvText);
        setImportFeedback({
          success: true,
          message: `${response.data.imported || 0} transactions imported successfully.`,
          rows: response.data.importedRows || [],
        });
        setCsvFile(null);
        event.target.reset?.();
        await fetchData();
      } catch (error) {
        console.error('Failed to upload CSV:', error);
        const message = error.response?.data?.error || 'Upload failed. Check CSV formatting.';
        setImportFeedback({ success: false, message });
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Unable to read the selected CSV file.');
    };
    reader.readAsText(csvFile);
  };

  const handleEditTransaction = (transaction) => {
    setAccountId(transaction.account_id);
    setCategoryId(transaction.category_id);
    setUserId(transaction.user_id);
    setType(transaction.type);
    setAmount(transaction.amount);
    setDescription(transaction.description || '');
    setDate(new Date(transaction.date).toISOString().split('T')[0]);
    setEditingId(transaction.id);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction');
      }
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  return (
    <div className="transactions-container">
      <h2>Transactions</h2>
      <form onSubmit={handleAddTransaction} className="transaction-form">
        <select value={user_id} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <select value={account_id} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Select Account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <select value={category_id} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="IN">Income</option>
          <option value="OUT">Expense</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">{editingId ? 'Update Transaction' : 'Add Transaction'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>

      <form onSubmit={handleUploadCsv} className="csv-upload-form">
        <h3>Import transactions from CSV</h3>
        <p>Required headers: account_id, category_id, type, amount, date</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={uploading || !csvFile || !user_id}>
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
        {importFeedback && (
          <div className={`import-feedback ${importFeedback.success ? 'success' : 'error'}`}>
            {importFeedback.message}
            {importFeedback.rows && importFeedback.rows.length > 0 && (
              <div>{importFeedback.rows.length} rows imported.</div>
            )}
          </div>
        )}
      </form>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Account</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.account_id);
              const category = categories.find((c) => c.id === transaction.category_id);
              return (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.type}</td>
                  <td>{parseFloat(transaction.amount).toFixed(2)}</td>
                  <td>{category?.name || 'N/A'}</td>
                  <td>{account?.name || 'N/A'}</td>
                  <td>{transaction.description || '-'}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditTransaction(transaction)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
