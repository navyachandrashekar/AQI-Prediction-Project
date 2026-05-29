import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ComparisonPage from './pages/ComparisonPage';
import AboutPage from './pages/AboutPage';
import './index.css';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar page={page} setPage={setPage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {page === 'dashboard'  && <DashboardPage />}
          {page === 'comparison' && <ComparisonPage />}
          {page === 'about'      && <AboutPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
