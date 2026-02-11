import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const QUOTES = [
  { text: "If you're going through hell, keep going.", author: "Winston Churchill" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "Almost everything will work again if you unplug it for a few minutes... including you.", author: "Anne Lamott" },
  { text: "Breathe. It's just a bad day, not a bad life.", author: "Johnny Depp" },
  { text: "Productivity isn't about doing more. It's about doing the right things better.", author: "James Clear" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "He who has a 'why' to live for can bear almost any 'how'.", author: "Friedrich Nietzsche" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
];

export default function MotivationalQuote({ onClose, fullScreen = true, autoClose = true }) {
  const [quote, setQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-center"
        >
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
          <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed mb-6">
            "{quote.text}"
          </p>
          <p className="text-lg text-white/40">— {quote.author}</p>
          <p className="text-sm text-white/20 mt-12">Tap to continue</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
        <div>
          <p className="text-white/90 text-sm leading-relaxed mb-2">"{quote.text}"</p>
          <p className="text-white/40 text-xs">— {quote.author}</p>
        </div>
      </div>
    </motion.div>
  );
}