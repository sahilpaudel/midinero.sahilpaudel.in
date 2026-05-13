import React, { useEffect, useMemo, useState } from 'react';
import { ACCOUNT_TYPES } from './lib/accountTypes.js';
import { mergeImportedAccounts } from './lib/importMerge.js';
import { loadAccounts, saveAccounts } from './lib/storage.js';
import { loadStatement, loadStatements } from './lib/statementStore.js';
import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Footer from './components/Footer.jsx';
import TypePicker from './components/TypePicker.jsx';
import AccountModal from './components/AccountModal.jsx';
import Dashboard from './views/Dashboard.jsx';
import AccountsView from './views/AccountsView.jsx';
import ImportView from './views/ImportView.jsx';
import StatementsView from './views/StatementsView.jsx';
import StatementReportView from './views/StatementReportView.jsx';
import SubscriptionsView from './views/SubscriptionsView.jsx';

export default function App() {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'accounts' | 'subscriptions' | 'import' | 'statements' | 'statement'
  const [statementId, setStatementId] = useState(null);
  const [modal, setModal] = useState(null);      // { type, accountId: string|null } | null
  const [picker, setPicker] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const openReport = (id) => {
    setStatementId(id);
    setView('statement');
    setModal(null);
  };

  // Persist every change.
  useEffect(() => saveAccounts(accounts), [accounts]);

  const totals = useMemo(() => {
    // Build latest-statement map so CC totalDue is used instead of a.balance
    const stmtByAccount = {};
    for (const s of loadStatements()) {
      if (s.accountId && !stmtByAccount[s.accountId]) stmtByAccount[s.accountId] = s;
    }
    const effectiveBalance = (a) => {
      if (a.type === 'creditCard') {
        // a.balance is authoritative when explicitly set (0 = paid, >0 = synced/manual).
        // Only fall back to statement totalDue when balance has never been set.
        if (a.balance != null && a.balance !== '') return Number(a.balance);
        const due = stmtByAccount[a.id]?.summary?.totalDue;
        return due != null ? Number(due) : 0;
      }
      return Number(a.balance) || 0;
    };
    const assets = accounts
      .filter((a) => ACCOUNT_TYPES[a.type]?.kind === 'asset')
      .reduce((s, a) => s + effectiveBalance(a), 0);
    const liabs = accounts
      .filter((a) => ACCOUNT_TYPES[a.type]?.kind === 'liability')
      .reduce((s, a) => s + effectiveBalance(a), 0);
    return { assets, liabs, net: assets - liabs };
  }, [accounts]);

  const upsert = (acc) => {
    setAccounts((prev) => {
      if (acc.id) {
        return prev.map((a) => (a.id === acc.id ? { ...acc, updatedAt: Date.now() } : a));
      }
      return [
        ...prev,
        { ...acc, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() },
      ];
    });
  };

  const remove = (id, type) =>
    setAccounts((prev) => prev.filter((a) => !(a.id === id && a.type === type)));

  const openAdd = (type) => {
    setPicker(false);
    setModal({ type, accountId: null });
  };
  const openEdit = (account) => setModal({ type: account.type, accountId: account.id });

  return (
    <div className="app-shell grain">
      <TopBar
        view={view}
        setView={setView}
        onAdd={() => setPicker(true)}
        hasAny={accounts.length > 0}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="container pb-32">
        {view === 'dashboard' && (
          <Dashboard
            totals={totals}
            accounts={accounts}
            onAdd={() => setPicker(true)}
            onEdit={openEdit}
            onImport={() => setView('import')}
          />
        )}
        {view === 'accounts' && (
          <AccountsView
            accounts={accounts}
            onAdd={() => setPicker(true)}
            onEdit={openEdit}
          />
        )}
        {view === 'import' && (
          <ImportView
            onAdd={() => setPicker(true)}
            existingAccounts={accounts}
            onImport={(incoming) => {
              const result = mergeImportedAccounts(accounts, incoming);
              saveAccounts(result.accounts);
              window.location.reload();
              return result;
            }}
          />
        )}
        {view === 'subscriptions' && <SubscriptionsView />}
        {view === 'statements' && (
          <StatementsView
            onOpen={openReport}
            accounts={accounts}
            onAccountUpdate={(id, changes) => {
              setAccounts(prev => prev.map(a =>
                a.id === id ? { ...a, ...changes, updatedAt: Date.now() } : a
              ));
            }}
          />
        )}
        {view === 'statement' && statementId && (
          <StatementReportView
            report={loadStatement(statementId)}
            onBack={() => setView('statements')}
            onDelete={() => { setStatementId(null); setView('statements'); }}
          />
        )}
      </main>

      <Footer />

      <BottomNav view={view} setView={setView} onAdd={() => setPicker(true)} />

      {picker && <TypePicker onClose={() => setPicker(false)} onPick={openAdd} />}
      {modal && (
        <AccountModal
          type={modal.type}
          account={modal.accountId ? accounts.find(a => a.id === modal.accountId) ?? null : null}
          onClose={() => setModal(null)}
          onSave={(data) => {
            upsert(data);
            setModal(null);
          }}
          onDelete={(id) => {
            remove(id, modal.type);
            setModal(null);
          }}
          onUpdate={(data) => upsert(data)}
          onViewReport={openReport}
        />
      )}
    </div>
  );
}
