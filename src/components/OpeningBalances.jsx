import React, { useState, useEffect } from 'react';
import { getOpeningBalances, getAccounts, addOpeningBalance, getAccountBalance } from '../services/api';
import './OpeningBalances.css';

export function OpeningBalances() {
  const [balances, setBalances] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [account_id, setAccountId] = useState('');
  const [balance, setBalance] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [accountStats, setAccountStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balancesRes, accountsRes] = await Promise.all([getOpeningBalances(), getAccounts()]);
      setBalances(balancesRes.data);
      setAccounts(accountsRes.data);
      if (accountsRes.data.length > 0) setAccountId(accountsRes.data[0].id);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    if (!account_id || balance === '') return;

    try {
      await addOpeningBalance(Number(account_id), Number(balance), month);
      setBalance('');
      setMonth(new Date().toISOString().slice(0, 7));
      await fetchData();
    } catch (error) {
      console.error('Failed to add opening balance:', error);
      alert('Failed to add opening balance');
    }
  };

  const handleGetBalance = async (e) => {
    e.preventDefault();
    if (!account_id || !selectedMonth) return;

    try {
      const balRes = await getAccountBalance(Number(account_id), selectedMonth);
      setAccountStats(balRes.data);
    } catch (error) {
      console.error('Failed to fetch account balance:', error);
      alert('Failed to fetch account balance');
    }
  };

  return (
    <div className="opening-balances-container">
      <h2>Opening Balances & Account Reports</h2>

      <div className="balances-section">
        <h3>Add Opening Balance</h3>
        <form onSubmit={handleAddBalance} className="balance-form">
          <select value={account_id} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Balance"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button type="submit">Set Opening Balance</button>
        </form>
      </div>

      <div className="balances-section">
        <h3>Account Report</h3>
        <form onSubmit={handleGetBalance} className="balance-form">
          <select value={account_id} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button type="submit">Get Balance Report</button>
        </form>

        {accountStats && (
          <div className="balance-report">
            <table>
              <tbody>
                <tr>
                  <td>Opening Balance:</td>
                  <td>{parseFloat(accountStats.opening_balance).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Income:</td>
                  <td style={{ color: 'green' }}>+{parseFloat(accountStats.income).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Expenses:</td>
                  <td style={{ color: 'red' }}>-{parseFloat(accountStats.expense).toFixed(2)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                  <td>Current Balance:</td>
                  <td>{parseFloat(accountStats.current_balance).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading balances...</p>
      ) : (
        <div>
          <h3>Balance History</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Account</th>
                <th>Balance</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((bal) => {
                const account = accounts.find((a) => a.id === bal.account_id);
                return (
                  <tr key={bal.id}>
                    <td>{bal.id}</td>
                    <td>{account?.name || 'N/A'}</td>
                    <td>{parseFloat(bal.balance).toFixed(2)}</td>
                    <td>{new Date(bal.month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
