// src/Test.js
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './Test.css';

function Test() {
  const [isLoading, setIsLoading] = useState(true);
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

  // Select a random question from the loaded list
  const loadRandomQuestion = (loadedQuestions) => {
    if (loadedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * loadedQuestions.length);
      setCurrentQuestion(loadedQuestions[randomIndex]);
    }
  };

  useEffect(() => {
    async function fetchQuestions() {
      const { data: questionsData, error } = await supabase
        .from("Questions")
        .select('id, Prompt, Option1, Option2, Option3, Option4, GraphLink, Answer');
      if (error) {
        console.error('Error fetching questions:', error);
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
      setIsLoading(false);
    }
    fetchQuestions();
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

  if (isLoading) {
    return <div className="loading">Loading questions...</div>;
  }
  if (!currentQuestion) {
    return <div className="loading">No questions available.</div>;
  }

  return (
    <div className="test-section">
      <div className="scoreboard">
        <p>Correct: {correctCount} | Incorrect: {wrongCount}</p>
      </div>
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
          <button className="next-button" onClick={handleNext}>
            Next Question
          </button>
        </div>
      )}
      <div className="report-bug-section">
        {!reporting ? (
          <button className="report-bug-button" onClick={() => setReporting(true)}>
            Report Bug
          </button>
        ) : (
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
                  value="vague_image"
                  checked={reportType === 'vague_image'}
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
                {currentQuestion.options.map((option, idx) => (
                  <label key={idx}>
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
                <span className="correct-answer">Correct Answer: {q.answer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Test;
