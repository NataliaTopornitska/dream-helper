import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DreamsHeader from './components/DreamsHeader/DreamsHeader';
import DreamsFooter from './components/DreamsFooter/DreamsFooter';

import HomePage from './pages/HomePage/HomePage';
import DreamsPage from './pages/DreamsPage/DreamsPage';
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
        </Routes>
      </main>
      {isDreamsPage ? <DreamsFooter /> : <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router basename="/dream-helper">
      <AppContent />
    </Router>
  );
}

export default App;
