import { useState, useRef, useEffect } from 'preact/hooks';

interface QuizQuestion {
  id: number;
  scenario: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
}

interface AnswerRecord {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
}

const quizResetStyle = `
  .quiz-choice:focus,
  .quiz-choice:focus-visible,
  .quiz-choice:focus-within,
  .quiz-choice:active {
    outline: none !important;
    border-color: #e2e8f0 !important;
    box-shadow: none !important;
    -webkit-appearance: none;
  }
`;

export default function Quiz({ title, questions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAnswered && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [isAnswered]);

  useEffect(() => {
    document.querySelectorAll('.quiz-choice').forEach((el) => {
      (el as HTMLElement).blur();
    });
  }, [currentQuestion]);

  const q = questions[currentQuestion];
  const total = questions.length;
  const isCorrect = selectedAnswer === q?.correctIndex;

  function handleAnswer(index: number) {
    if (isAnswered) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedAnswer(index);
    setIsAnswered(true);
    const correct = index === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { questionIndex: currentQuestion, selectedIndex: index, correct }]);
  }

  function handleNext() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (currentQuestion + 1 >= total) {
      setIsComplete(true);
    } else {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }

  function handleRetake() {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  }

  if (isComplete) {
    const pct = Math.round((score / total) * 100);
    return (
      <div style={styles.container}>
        <style dangerouslySetInnerHTML={{ __html: quizResetStyle }} />
        <div style={styles.summaryHeader}>
          <h2 style={styles.summaryTitle}>Quiz Complete!</h2>
          <div style={styles.scoreCircle}>
            <span style={styles.scoreFraction}>{score}/{total}</span>
            <span style={styles.scorePct}>{pct}%</span>
          </div>
        </div>

        <div style={styles.summaryList}>
          {questions.map((question, i) => {
            const record = answers[i];
            const wasCorrect = record?.correct;
            return (
              <div
                key={question.id}
                style={{
                  ...styles.summaryItem,
                  borderLeft: `4px solid ${wasCorrect ? '#16a34a' : '#dc2626'}`,
                }}
              >
                <div style={styles.summaryItemHeader}>
                  <span style={{ ...styles.summaryBadge, background: wasCorrect ? '#dcfce7' : '#fef2f2', color: wasCorrect ? '#16a34a' : '#dc2626' }}>
                    {wasCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                  <span style={styles.summaryQNum}>Question {i + 1}</span>
                </div>
                <p style={styles.summaryQText}>{question.question}</p>
                {!wasCorrect && (
                  <p style={styles.summaryExplanation}>
                    <strong>Correct answer:</strong> {question.choices[question.correctIndex]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button style={styles.retakeBtn} onClick={handleRetake}>
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: quizResetStyle }} />
      <div style={styles.header}>
        <span style={styles.questionCount}>Question {currentQuestion + 1} of {total}</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentQuestion + (isAnswered ? 1 : 0)}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Quiz progress: ${currentQuestion + (isAnswered ? 1 : 0)} of ${total} questions completed`}
        style={styles.progressTrack}
      >
        <div
          style={{
            ...styles.progressFill,
            width: `${((currentQuestion + (isAnswered ? 1 : 0)) / total) * 100}%`,
          }}
        />
      </div>

      <div style={styles.scenarioBox}>
        <p style={styles.scenarioLabel}>Scenario</p>
        <p style={styles.scenarioText}>{q.scenario}</p>
      </div>

      <h3 style={styles.questionText}>{q.question}</h3>

      <div style={styles.choicesList}>
        {q.choices.map((choice, i) => {
          let choiceStyle = { ...styles.choiceBtn };
          if (isAnswered) {
            if (i === q.correctIndex) {
              choiceStyle = { ...choiceStyle, ...styles.choiceCorrect };
            } else if (i === selectedAnswer) {
              choiceStyle = { ...choiceStyle, ...styles.choiceWrong };
            } else {
              choiceStyle = { ...choiceStyle, ...styles.choiceDisabled };
            }
          }
          return (
            <button
              key={i}
              class="quiz-choice"
              style={choiceStyle}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              aria-pressed={selectedAnswer === i}
            >
              <span style={styles.choiceLetter}>{String.fromCharCode(65 + i)}</span>
              <span style={styles.choiceText}>{choice}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" style={styles.feedbackArea}>
        {isAnswered && isCorrect && (
          <div style={styles.feedbackCorrect}>
            <strong>Correct!</strong> Well done.
          </div>
        )}
        {isAnswered && !isCorrect && (
          <div style={styles.feedbackWrong}>
            <strong>Not quite.</strong> {q.explanation}
          </div>
        )}
      </div>

      {isAnswered && (
        <button ref={nextButtonRef} style={styles.nextBtn} onClick={handleNext}>
          {currentQuestion + 1 >= total ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, Record<string, string | number>> = {
  container: {
    maxWidth: '48rem',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  questionCount: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 600,
  },
  progressTrack: {
    width: '100%',
    height: '0.5rem',
    background: '#e2e8f0',
    borderRadius: '0.25rem',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '0.25rem',
    transition: 'width 0.3s ease',
  },
  scenarioBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
  },
  scenarioLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '0.5rem',
  },
  scenarioText: {
    fontSize: '0.9375rem',
    lineHeight: 1.625,
    color: '#1e293b',
  },
  questionText: {
    fontSize: '1.125rem',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#1a1f36',
    marginBottom: '1rem',
  },
  choicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  choiceBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    width: '100%',
    padding: '0.875rem 1rem',
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  },
  choiceCorrect: {
    background: '#f0fdf4',
    borderColor: '#16a34a',
    cursor: 'default',
  },
  choiceWrong: {
    background: '#fef2f2',
    borderColor: '#dc2626',
    cursor: 'default',
  },
  choiceDisabled: {
    opacity: 0.55,
    cursor: 'default',
  },
  choiceLetter: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    flexShrink: 0,
    borderRadius: '50%',
    background: '#f1f5f9',
    fontWeight: 700,
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  choiceText: {
    paddingTop: '0.125rem',
  },
  feedbackArea: {
    minHeight: '1rem',
    marginTop: '1rem',
  },
  feedbackCorrect: {
    padding: '0.875rem 1rem',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem',
    color: '#15803d',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
  },
  feedbackWrong: {
    padding: '0.875rem 1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    color: '#991b1b',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
  },
  nextBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1.25rem',
    padding: '0.75rem 2rem',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  summaryHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a1f36',
    marginBottom: '1rem',
  },
  scoreCircle: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '7rem',
    height: '7rem',
    borderRadius: '50%',
    background: '#f8fafc',
    border: '3px solid #3b82f6',
  },
  scoreFraction: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a1f36',
  },
  scorePct: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  summaryItem: {
    padding: '0.875rem 1rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
  },
  summaryItemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.375rem',
  },
  summaryBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  summaryQNum: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  summaryQText: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: '#1e293b',
  },
  summaryExplanation: {
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    color: '#64748b',
    marginTop: '0.375rem',
  },
  retakeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 2rem',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '0 auto',
  },
};
