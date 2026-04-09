import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import CaseList from './components/cases/CaseList';
import CaseForm from './components/cases/CaseForm';
import CaseDetail from './components/cases/CaseDetail';
import { ToastProvider } from './components/common/ToastContext';
import './styles/App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CaseList />} />
              <Route path="/cases/new" element={<CaseForm />} />
              <Route path="/cases/:id/edit" element={<CaseForm />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
