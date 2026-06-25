import React, { useState, useEffect } from 'react';
import { getAccounts, addAccount, updateAccount, deleteAccount, getUsers, getAccountBalance } from '../services/api';
import './Accounts.css';

export function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [balancesByAccount, setBalancesByAccount] = useState({});
  const [name, setName] = useState('');
  const [type, setType] = useState('MPESA');
  const [user_id, setUserId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, usersRes] = await Promise.all([getAccounts(), getUsers()]);
      setAccounts(accountsRes.data);
      setUsers(usersRes.data);
      if (usersRes.data.length > 0) setUserId(usersRes.data[0].id);
      const balances = {};
      await Promise.all(
        accountsRes.data.map(async (account) => {
          try {
            const balanceRes = await getAccountBalance(account.id, new Date().toISOString().slice(0, 7));
            balances[account.id] = balanceRes.data.current_balance;
          } catch (balanceError) {
            balances[account.id] = 0;
          }
        })
      );
      setBalancesByAccount(balances);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!name || !user_id) return;

    try {
      if (editingId) {
        await updateAccount(editingId, name, type);
        setEditingId(null);
      } else {
        await addAccount(name, type, Number(user_id));
      }
      setName('');
      await fetchData();
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account');
    }
  };

  const handleEditAccount = (account) => {
    setName(account.name);
    setType(account.type);
    setEditingId(account.id);
  };

  const loadAccountBalance = async (accountId) => {
    try {
      const response = await getAccountBalance(accountId, new Date().toISOString().slice(0, 7));
      setBalancesByAccount((prev) => ({ ...prev, [accountId]: response.data.current_balance }));
    } catch (balanceError) {
      console.error('Failed to load account balance:', balanceError);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account');
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setType('MPESA');
    setEditingId(null);
  };

  return (
    <div className="accounts-container">
      <h2>Accounts</h2>
      <form onSubmit={handleAddAccount} className="account-form">
        <input
          type="text"
          placeholder="Account Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="MPESA">M-PESA</option>
          <option value="CASH">CASH</option>
          <option value="BANK">BANK</option>
        </select>
        <select value={user_id} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update Account' : 'Add Account'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>

      {loading ? (
        <p>Loading accounts...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>User ID</th>
              <th>Current Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{account.type}</td>
                <td>{account.user_id}</td>
                <td>{Number(balancesByAccount[account.id] || 0).toFixed(2)}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditAccount(account)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteAccount(account.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
