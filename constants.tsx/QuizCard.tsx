
import React, { useState } from 'react';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
  onAnswer: (correct: boolean) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    onAnswer(index === quiz.correctIndex);
  };

  return (
    <div className="w-full max-w-xl bg-slate-800/50 rounded-2xl border border-white/10 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">❓</span>
        <h3 className="text-lg font-bold text-slate-100">{quiz.question}</h3>
      </div>

      <div className="space-y-3">
        {quiz.options.map((option, idx) => {
          let stateClass = "bg-slate-700/50 border-white/5 hover:border-indigo-500/50 hover:bg-slate-700";
          if (revealed) {
            if (idx === quiz.correctIndex) {
              stateClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
            } else if (idx === selected) {
              stateClass = "bg-rose-500/20 border-rose-500 text-rose-400";
            } else {
              stateClass = "opacity-50 grayscale";
            }
          }

          return (
            <button
              key={idx}
              disabled={revealed}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${stateClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-indigo-300 font-medium mb-1">Giải thích:</p>
          <p className="text-slate-300 text-sm leading-relaxed">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
