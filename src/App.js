// src/App.js
import React, { useState } from 'react';
import './App.css';
import Home from './Home';
import Test from './Test';
import LearnSection from './LearnSection';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('intro');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <h1>DMV Mock Test</h1>
        <nav className="nav-bar">
          <button onClick={() => setActiveView('intro')}>Home</button>
          <button onClick={() => setActiveView('test')}>Test</button>
          <button onClick={() => setActiveView('learn')}>Learn</button>
        </nav>
        <button className="theme-toggle" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>
      <main className="main-content">
        {activeView === 'intro' && <Home />}
        {activeView === 'test' && <Test />}
        {activeView === 'learn' && <LearnSection />}
      </main>
    </div>
  );
}

export default App;
