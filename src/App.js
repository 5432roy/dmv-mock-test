// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './Home';
import Test from './Test';
import LearnSection from './LearnSection';
import { fetchQuestions } from './dataService';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeView, setActiveView] = useState('intro');

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reportType, setReportType] = useState('');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const qs = await fetchQuestions();
        setQuestions(qs);
        if (!currentQuestion && qs.length > 0) {
          loadRandomQuestion(qs);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    // We intentionally run this only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRandomQuestion = (qs) => {
    if (qs.length > 0) {
      const randomIndex = Math.floor(Math.random() * qs.length);
      setCurrentQuestion(qs[randomIndex]);
    }
  };

  const handleAnswer = (option) => {
    if (!currentQuestion) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (option === currentQuestion.answer) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
      if (!wrongQuestions.find(q => q.id === currentQuestion.id)) {
        setWrongQuestions(prev => [...prev, currentQuestion]);
      }
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setReporting(false);
    setReportType('');
    setSuggestedAnswer('');
    loadRandomQuestion(questions);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <h1>Driving Permit Prep</h1>
        <nav className="nav-bar">
          <button onClick={() => setActiveView('intro')}>Home</button>
          <button onClick={() => setActiveView('test')}>Test</button>
          <button onClick={() => setActiveView('learn')}>Learn</button>
        </nav>
        <img
          className="theme-toggle-img"
          src={theme === 'light' ? 'LandSwitchLight.png' : 'LandSwitchDark.png'}
          alt="Toggle theme"
          onClick={toggleTheme}
        />
      </header>
      <main className="main-content">
        {activeView === 'intro' && <Home />}
        {activeView === 'test' && (
          <Test
            isLoading={isLoading}
            currentQuestion={currentQuestion}
            showAnswer={showAnswer}
            selectedAnswer={selectedAnswer}
            correctCount={correctCount}
            wrongCount={wrongCount}
            wrongQuestions={wrongQuestions}
            reporting={reporting}
            reportType={reportType}
            suggestedAnswer={suggestedAnswer}
            handleAnswer={handleAnswer}
            handleNext={handleNext}
            setReporting={setReporting}
            setReportType={setReportType}
            setSuggestedAnswer={setSuggestedAnswer}
          />
        )}
        {activeView === 'learn' && <LearnSection />}
      </main>
    </div>
  );
}

export default App;
