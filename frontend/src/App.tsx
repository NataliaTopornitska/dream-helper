import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DreamsHeader from './components/DreamsHeader/DreamsHeader';
import DreamsFooter from './components/DreamsFooter/DreamsFooter';

import HomePage from './pages/HomePage';
import DreamsPage from './pages/DreamsPage';
import DreamDetailsPage from './pages/DreamDetailsPage';
import './App.scss';

function AppContent() {
  const location = useLocation();
  const isDreamsPage = location.pathname.startsWith('/dreams');

  return (
    <div className="app">
      {isDreamsPage ? <DreamsHeader /> : <Header />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dreams" element={<DreamsPage />} />
          <Route path="/dreams/:id" element={<DreamDetailsPage />} />
        </Routes>
      </main>
      {isDreamsPage ? <DreamsFooter /> : <Footer />}
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
