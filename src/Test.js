// src/Test.js
import React from 'react';
import './Test.css';
import { submitBugReport } from './dataService';

function Test({
  isLoading,
  currentQuestion,
  showAnswer,
  selectedAnswer,
  correctCount,
  wrongCount,
  wrongQuestions,
  reporting,
  reportType,
  suggestedAnswer,
  handleAnswer,
  handleNext,
  setReporting,
  setReportType,
  setSuggestedAnswer,
}) {
  const onBugReportSubmit = async (e) => {
    e.preventDefault();
    const report = {
      problem_id: currentQuestion.id,
      report_type: reportType,
      suggested_answer: reportType === 'wrong_options' ? suggestedAnswer : null,
    };
    try {
      await submitBugReport(report);
      alert("Thank you! Your bug report has been submitted.");
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Failed to submit bug report. Please try again later.");
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
    <div className="question-container">
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
          <form className="bug-report-form" onSubmit={onBugReportSubmit}>
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
