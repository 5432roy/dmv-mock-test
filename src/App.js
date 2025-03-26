import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [theme, setTheme] = useState('light');
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [reporting, setReporting] = useState(false);
  const [reportType, setReportType] = useState('');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState([]);


  const loadRandomQuestion = (loadedQuestions) => {
    if (loadedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * loadedQuestions.length);
      setCurrentQuestion(loadedQuestions[randomIndex]);
    }
  };

  useEffect(() => {
    async function fetchData() {
      // Fetch questions from Supabase table "Questions"
      const { data: questionsData, error: questionsError } = await supabase
        .from("Questions")
        .select('id, Prompt, Option1, Option2, Option3, Option4, GraphLink, Answer');
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      } else {
        const transformed = questionsData.map(q => ({
          id: q.id,
          question: q.Prompt,
          options: [q.Option1, q.Option2, q.Option3, q.Option4],
          answer: q.Answer,
          graphLink: q.GraphLink,
        }));
        setQuestions(transformed);
        loadRandomQuestion(transformed);
      }
    }
    fetchData();
  }, []);

  const handleAnswer = (option) => {
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

  const handleBugReportSubmit = async (e) => {
    e.preventDefault();

    try {
      const rowToInsert = {
        problem_id: currentQuestion.id,
        report_type: reportType,
        suggested_answer: reportType === 'wrong_options' ? suggestedAnswer : null,
      };

      const { error } = await supabase
        .from('bugs_report')
        .insert([rowToInsert]);

      if (error) {
        console.error('Error inserting bug report:', error);
        alert('Failed to submit bug report. Please try again later.');
      } else {
        alert('Thank you! Your bug report has been submitted.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    }

    setReportType('');
    setSuggestedAnswer('');
    setReporting(false);
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
          {/* Scoreboard */}
          <div className="scoreboard">
            <p>Correct: {correctCount} | Incorrect: {wrongCount}</p>
          </div>

          {/* If GraphLink exists, display the image; otherwise, display the text prompt */}
          {currentQuestion.graphLink ? (
            <img
              src={currentQuestion.graphLink}
              alt="Question Graphic"
              className="question-image"
            />
          ) : (
            <p className="question-text">{currentQuestion.question}</p>
          )}
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
                      value="wrong_options"
                      checked={reportType === 'wrong_options'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Wrong Answer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bugType"
                      value="vauge_image"
                      checked={reportType === 'vauge_image'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Vague Image
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bugType"
                      value="vague_description"
                      checked={reportType === 'vague_description'}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    Vague Description
                  </label>
                </div>
                {reportType === 'wrong_options' && (
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

        {/* Section to review questions answered incorrectly */}
        {wrongQuestions.length > 0 && (
          <div className="wrong-questions-section">
            <h2>Review Wrong Answers</h2>
            <ul>
              {wrongQuestions.map((q, index) => (
                <li key={index} className="wrong-question-item">
                  {q.graphLink ? (
                    <img
                      src={q.graphLink}
                      alt="Question Thumbnail"
                      className="question-thumbnail"
                    />
                  ) : (
                    <span>{q.question}</span>
                  )}
                  <br />
                  <span className="correct-answer">{q.answer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
