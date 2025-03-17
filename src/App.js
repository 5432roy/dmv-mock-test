import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [reportData, setReportData] = useState([]); // Holds bug reports for each question
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reportType, setReportType] = useState('');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [theme, setTheme] = useState('light');

  // Pick a random question by generating a random id between 1 and 30.
  const loadRandomQuestion = (loadedQuestions) => {
    const randomId = Math.floor(Math.random() * 30) + 1;
    const foundQuestion = loadedQuestions.find(q => q.id === randomId);

    if (foundQuestion) {
      setCurrentQuestion(foundQuestion);
    } else if (loadedQuestions.length > 0) {
      // Fallback: pick any random question from the available list.
      const randomIndex = Math.floor(Math.random() * loadedQuestions.length);
      setCurrentQuestion(loadedQuestions[randomIndex]);
    }
  };

  useEffect(() => {
    // Fetch the questions from public/questions.json.
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        loadRandomQuestion(data.questions);
      })
      .catch(err => console.error('Error fetching questions:', err));

    // Fetch the report data from public/report.json.
    fetch('/report.json')
      .then(res => res.json())
      .then(data => {
        setReportData(data.reports || []);
      })
      .catch(err => console.error('Error fetching report data:', err));
  }, []);

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    setShowAnswer(true);
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

  const handleBugReportSubmit = (e) => {
    e.preventDefault();
    const questionId = currentQuestion.id;
    // Find existing report entry for the current question.
    let reportEntry = reportData.find(report => report.questionId === questionId);
    if (!reportEntry) {
      reportEntry = {
        questionId,
        wrongAnswer: { count: 0, suggestions: {} },
        vagueImage: 0,
        vagueDescription: 0
      };
    }

    if (reportType === 'wrongAnswer') {
      reportEntry.wrongAnswer.count += 1;
      const suggestion = suggestedAnswer;
      reportEntry.wrongAnswer.suggestions[suggestion] =
        (reportEntry.wrongAnswer.suggestions[suggestion] || 0) + 1;
    } else if (reportType === 'vagueImage') {
      reportEntry.vagueImage += 1;
    } else if (reportType === 'vagueDescription') {
      reportEntry.vagueDescription += 1;
    }

    // Update the report data in state.
    const updatedReportData = reportData.filter(report => report.questionId !== questionId);
    updatedReportData.push(reportEntry);
    setReportData(updatedReportData);

    // Reset the bug report UI.
    setReportType('');
    setSuggestedAnswer('');
    setReporting(false);

    // In a real application, you would persist these changes to a backend or update report.json.
  };

  if (!currentQuestion) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <h1>DMV Mock Test</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>
      <main className="main-content">
        <div className="question-container">
          <p className="question-text">{currentQuestion.question}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  showAnswer && option === currentQuestion.answer ? 'correct' : ''
                } ${
                  showAnswer && selectedAnswer === option && option !== currentQuestion.answer
                    ? 'incorrect'
                    : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={showAnswer}
              >
                {option}
              </button>
            ))}
          </div>
          {showAnswer && (
            <div className="answer-section">
              {selectedAnswer === currentQuestion.answer ? (
                <p className="feedback correct-feedback">Correct!</p>
              ) : (
                <p className="feedback incorrect-feedback">
                  Incorrect. The correct answer is: <strong>{currentQuestion.answer}</strong>
                </p>
              )}
              <button className="next-button" onClick={handleNext}>
                Next Question
              </button>
            </div>
          )}

          {/* Bug Report Section */}
          <div className="report-bug-section">
            {!reporting && (
              <button className="report-bug-button" onClick={() => setReporting(true)}>
                Report Bug
              </button>
            )}
            {reporting && (
              <form className="bug-report-form" onSubmit={handleBugReportSubmit}>
                <p>Report a bug:</p>
                <div className="bug-type-options">
                  <label>
                    <input
                      type="radio"
                      name="bugType"
                      value="wrongAnswer"
                      checked={reportType === 'wrongAnswer'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Wrong Answer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bugType"
                      value="vagueImage"
                      checked={reportType === 'vagueImage'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Vague Image
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bugType"
                      value="vagueDescription"
                      checked={reportType === 'vagueDescription'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Vague Description
                  </label>
                </div>
                {reportType === 'wrongAnswer' && (
                  <div className="suggested-answer">
                    <p>Select the answer you believe is correct:</p>
                    {currentQuestion.options.map((option, index) => (
                      <label key={index}>
                        <input
                          type="radio"
                          name="suggestedAnswer"
                          value={option}
                          checked={suggestedAnswer === option}
                          onChange={(e) => setSuggestedAnswer(e.target.value)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                <div className="bug-report-buttons">
                  <button type="submit" className="submit-report-button">
                    Submit Report
                  </button>
                  <button
                    type="button"
                    className="cancel-report-button"
                    onClick={() => setReporting(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
