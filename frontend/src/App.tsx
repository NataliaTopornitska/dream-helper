import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import HomePage from './pages/HomePage';
import DreamsPage from './pages/DreamsPage';
import DreamDetailsPage from './pages/DreamDetailsPage';
import UserProfilePage from './pages/UserProfilePage';

import './App.scss';

function AppContent() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dreams" element={<DreamsPage />} />
          <Route path="/dreams/:id" element={<DreamDetailsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
