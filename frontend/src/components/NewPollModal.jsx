import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { X, BarChart3, Plus, Trash2 } from 'lucide-react';

export default function NewPollModal() {
  const { newPollModalOpen, setNewPollModalOpen, createPoll } = useWatchParty();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);

  if (!newPollModalOpen) return null;

  function handleAddOption() {
    if (options.length < 4) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  }

  function handleRemoveOption(idx) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  }

  function handleOptionChange(idx, val) {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    createPoll(question.trim(), options.filter((o) => o.trim()), 60);
    setQuestion('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#080d1a] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 flex flex-col gap-5 text-white font-mono text-xs">
        <button
          onClick={() => setNewPollModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              AUDIENCE CONSENSUS
            </span>
            <h2 className="font-display text-lg font-bold text-white">Create Live Poll</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Poll Question:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which film next: Interstellar or Dune?"
              className="w-full bg-[#040711] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-sans text-xs focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Options (Min 2, Max 4):</span>
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-primary hover:underline font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Option
                </button>
              )}
            </div>

            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="flex-1 bg-[#040711] border border-white/10 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-primary focus:outline-none"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
          >
            Launch Live Poll to Watch Party
          </button>
        </form>
      </div>
    </div>
  );
}
