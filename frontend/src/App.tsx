import React from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Statistics from './components/Statistics/Statistics';
import DreamCarousel from './components/DreamCarousel/DreamCarousel';
import Vision from './components/Vision/Vision';
import HowItWorks from './components/HowItWorks/HowItWorks';
import JoinUs from './components/JoinUs/JoinUs';
import Footer from './components/Footer/Footer';
import './App.scss';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Statistics />
        <DreamCarousel />
        <Vision />
        <HowItWorks />
        <JoinUs />
      </main>
      <Footer />
    </div>
  );
}

export default App;
