import React, { useState, useEffect } from 'react';
import { getTransactions, getCategories, getAccounts, getOpeningBalances } from '../services/api';
import './Analysis.css';

function formatMonth(monthKey) {
  const [year, month] = monthKey.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function Analysis() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [openingBalances, setOpeningBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, categoriesRes, accountsRes, balancesRes] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAccounts(),
        getOpeningBalances(),
      ]);
      setTransactions(transRes.data || []);
      setCategories(categoriesRes.data || []);
      setAccounts(accountsRes.data || []);
      setOpeningBalances(balancesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOpeningIncome = openingBalances
    .reduce((sum, bal) => sum + Number(bal.balance), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'IN')
    .reduce((sum, t) => sum + Number(t.amount), 0) + totalOpeningIncome;

  const totalExpense = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlySummary = transactions.reduce((acc, transaction) => {
    const monthKey = transaction.date.slice(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0 };
    }
    const amount = Number(transaction.amount);
    if (transaction.type === 'IN') {
      acc[monthKey].income += amount;
    } else if (transaction.type === 'OUT') {
      acc[monthKey].expense += amount;
    }
    return acc;
  }, {});

  openingBalances.forEach((balance) => {
    const monthKey = balance.month.slice(0, 7);
    if (!monthlySummary[monthKey]) {
      monthlySummary[monthKey] = { income: 0, expense: 0 };
    }
    monthlySummary[monthKey].income += Number(balance.balance);
  });

  const monthlyKeys = Object.keys(monthlySummary)
    .sort()
    .slice(-6);

  const dailySummary = transactions.reduce((acc, transaction) => {
    const dayKey = transaction.date;
    if (!acc[dayKey]) {
      acc[dayKey] = { income: 0, expense: 0 };
    }
    const amount = Number(transaction.amount);
    if (transaction.type === 'IN') {
      acc[dayKey].income += amount;
    } else if (transaction.type === 'OUT') {
      acc[dayKey].expense += amount;
    }
    return acc;
  }, {});

  const allDailyKeys = Object.keys(dailySummary).sort();
  const dailyKeys = allDailyKeys.slice(-14);

  const categoryExpenses = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((acc, transaction) => {
      const key = transaction.category_id;
      acc[key] = (acc[key] || 0) + Number(transaction.amount);
      return acc;
    }, {});

  const sortedCategoryExpenses = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === Number(categoryId));
      return {
        category: category?.name || `Category ${categoryId}`,
        amount,
      };
    });

  const accountActivity = transactions.reduce((acc, transaction) => {
    const accountId = transaction.account_id;
    acc[accountId] = (acc[accountId] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const sortedAccountActivity = Object.entries(accountActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([accountId, amount]) => {
      const account = accounts.find((a) => a.id === Number(accountId));
      return {
        account: account?.name || `Account ${accountId}`,
        amount,
      };
    });

  const incomeVsExpenseRatio = totalExpense > 0 ? totalIncome / totalExpense : 0;

  const maxMonthlyValue = monthlyKeys.reduce((max, key) => {
    const monthData = monthlySummary[key];
    return Math.max(max, monthData.income, monthData.expense);
  }, 1);

  const maxDailyValue = dailyKeys.reduce((max, key) => {
    const dayData = dailySummary[key];
    return Math.max(max, dayData.income, dayData.expense);
  }, 1);

  function formatDay(dayKey) {
    return new Date(dayKey).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="analysis-container">
      <h2>Financial Analysis</h2>

      {loading ? (
        <p>Loading analysis...</p>
      ) : (
        <>
          <div className="analysis-cards">
            <div className="analysis-card">
              <h3>Total Income</h3>
              <p className="income">Ksh {totalIncome.toFixed(2)}</p>
            </div>
            <div className="analysis-card">
              <h3>Total Expenses</h3>
              <p className="expense">Ksh {totalExpense.toFixed(2)}</p>
            </div>
            <div className="analysis-card">
              <h3>Net Result</h3>
              <p className={totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}>
                Ksh {(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
            <div className="analysis-card">
              <h3>Income / Expense</h3>
              <p>{incomeVsExpenseRatio ? incomeVsExpenseRatio.toFixed(2) : 'N/A'}</p>
            </div>
          </div>

          <section className="analysis-section">
            <h3>Income vs Expenses (last 6 months)</h3>
            <div className="chart-grid chart-grid-vertical">
              {monthlyKeys.map((monthKey) => {
                const monthData = monthlySummary[monthKey];
                const incomeHeight = clamp((monthData.income / maxMonthlyValue) * 100, 5, 100);
                const expenseHeight = clamp((monthData.expense / maxMonthlyValue) * 100, 5, 100);
                return (
                  <div key={monthKey} className="chart-column vertical">
                    <div className="chart-label">{formatMonth(monthKey)}</div>
                    <div className="chart-bar-container">
                      <div className="chart-bar income-bar" style={{ height: `${incomeHeight}%` }}>
                        {monthData.income ? monthData.income.toFixed(0) : ''}
                      </div>
                    </div>
                    <div className="chart-bar-container">
                      <div className="chart-bar expense-bar" style={{ height: `${expenseHeight}%` }}>
                        {monthData.expense ? monthData.expense.toFixed(0) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analysis-section">
            <h3>Expense per Day (last 14 days)</h3>
            <div className="chart-grid chart-grid-vertical">
              {dailyKeys.map((dayKey) => {
                const dayData = dailySummary[dayKey];
                const expenseHeight = clamp((dayData.expense / maxDailyValue) * 100, 5, 100);
                return (
                  <div key={dayKey} className="chart-column small vertical">
                    <div className="chart-label">{formatDay(dayKey)}</div>
                    <div className="chart-bar-container">
                      <div className="chart-bar expense-bar" style={{ height: `${expenseHeight}%` }}>
                        {dayData.expense ? dayData.expense.toFixed(0) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analysis-section">
            <h3>Income per Day (last 14 days)</h3>
            <div className="chart-grid chart-grid-vertical">
              {dailyKeys.map((dayKey) => {
                const dayData = dailySummary[dayKey];
                const incomeHeight = clamp((dayData.income / maxDailyValue) * 100, 5, 100);
                return (
                  <div key={dayKey} className="chart-column small vertical">
                    <div className="chart-label">{formatDay(dayKey)}</div>
                    <div className="chart-bar-container">
                      <div className="chart-bar income-bar" style={{ height: `${incomeHeight}%` }}>
                        {dayData.income ? dayData.income.toFixed(0) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analysis-section comparisons">
            <div>
              <h3>Top Expense Categories</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategoryExpenses.length > 0 ? (
                    sortedCategoryExpenses.map((item) => (
                      <tr key={item.category}>
                        <td>{item.category}</td>
                        <td>Ksh {item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No expense data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h3>Top Accounts by Activity</h3>
              <table>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Transactions Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAccountActivity.length > 0 ? (
                    sortedAccountActivity.map((item) => (
                      <tr key={item.account}>
                        <td>{item.account}</td>
                        <td>Ksh {item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No activity data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
