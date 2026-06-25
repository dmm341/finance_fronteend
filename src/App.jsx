import React, { useState } from 'react';
import { Users } from './components/Users';
import { Accounts } from './components/Accounts';
import { Categories } from './components/Categories';
import { Transactions } from './components/Transactions';
import { OpeningBalances } from './components/OpeningBalances';
import { Analysis } from './components/Analysis';
import './App.css';
function App() {
  const [activeTab, setActiveTab] = useState('transactions');
  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Finance Tracker</h1>
        <nav className="nav">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'accounts' ? 'active' : ''}
            onClick={() => setActiveTab('accounts')}
          >
            Accounts
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={activeTab === 'balances' ? 'active' : ''}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </button>
          <button
            className={activeTab === 'analysis' ? 'active' : ''}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </button>
        </nav>
      </header>

      <main className="app-content">
        {activeTab === 'users' && <Users />}
        {activeTab === 'accounts' && <Accounts />}
        {activeTab === 'categories' && <Categories />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'balances' && <OpeningBalances />}
        {activeTab === 'analysis' && <Analysis />}
      </main>
    </div>
  );
}

export default App;
