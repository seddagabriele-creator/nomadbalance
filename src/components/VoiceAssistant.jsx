import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

// ── Fuzzy intent matching ───────────────────────────────────────────
// Each intent has a list of trigger words/phrases and a score weight.
// We tokenize the input text, check how many trigger words appear, and
// pick the intent with the highest score. This handles natural Italian
// phrasing without needing an LLM.

const INTENT_DEFS = {
  addTask: {
    triggers: ["task", "compito", "attività", "promemoria", "nota", "ricordami", "segna", "scrivi", "appunta", "aggiungi", "nuova", "nuovo", "crea", "metti", "to do", "todo"],
    needsParam: true,
    // Words that precede the actual task title — stripped from the param
    prefixWords: ["task", "compito", "attività", "promemoria", "nota", "che", "di", "un", "una", "il", "la", "lo", "to do", "todo", "nuovo", "nuova"],
  },
  logMeal: {
    triggers: ["pasto", "meal", "mangiato", "pranzo", "pranzato", "cena", "cenato", "colazione", "snack", "spuntino", "merenda", "mangio", "mangiare", "cibo", "food", "registra pasto", "log meal", "ho fame"],
  },
  startFocus: {
    triggers: ["musica", "music", "audio", "focus", "concentrazione", "suono", "suona", "play", "avvia", "parti", "start", "inizia", "comincia", "lavorare", "lavoro", "sessione", "metti su", "accendi"],
    boostPhrases: ["metti musica", "avvia musica", "parti musica", "start focus", "metti su la musica", "fammi sentire", "voglio concentrarmi", "inizia a lavorare", "metti l'audio", "accendi la musica"],
  },
  pauseTimer: {
    triggers: ["pausa", "pause", "stop", "ferma", "fermati", "basta", "smetti", "aspetta", "un momento", "un attimo", "hold", "wait"],
    boostPhrases: ["metti in pausa", "fermati un attimo", "stop musica", "ferma tutto", "pausa timer"],
  },
  resumeTimer: {
    triggers: ["riprendi", "resume", "continua", "vai", "go", "ricomincia", "riprendere", "avanti", "prosegui"],
    boostPhrases: ["continua a suonare", "riprendi la musica", "vai avanti", "continua il timer"],
  },
  switchRelax: {
    triggers: ["relax", "rilassati", "rilassa", "rilassamento", "chill", "calma", "tranquillo", "decompressione", "stacca"],
    boostPhrases: ["voglio rilassarmi", "metti relax", "modalità relax", "stacca un po'", "ho bisogno di calma"],
  },
  switchFocus: {
    triggers: ["focus", "concentrazione", "lavoro", "work", "produttivo", "torna"],
    boostPhrases: ["torna al focus", "torna a lavorare", "basta relax", "modalità lavoro", "concentrazione"],
    // Only match if "torna" or "back" or "basta relax" present — otherwise conflicts with startFocus
    requireAny: ["torna", "back", "basta", "modalità lavoro", "switch"],
  },
  startBreathing: {
    triggers: ["respirazione", "breathing", "respira", "breath", "respiro", "inspira", "espira", "calma"],
    boostPhrases: ["esercizio di respirazione", "facciamo respirazione", "voglio respirare", "breathing session"],
  },
  goAway: {
    triggers: ["via", "away", "vado", "esco", "torno dopo", "pausa pranzo", "pausa caffè", "allontano"],
    boostPhrases: ["sono via", "vado via", "me ne vado", "going away", "mi allontano", "pausa pranzo", "torno dopo"],
    requireAny: ["via", "away", "vado", "esco", "allontano", "pausa pranzo", "pausa caffè"],
  },
  comeBack: {
    triggers: ["tornato", "back", "qui", "tornata", "presente", "rientro", "rientrato"],
    boostPhrases: ["sono tornato", "sono qui", "sono back", "i'm back", "sono rientrato", "eccomi"],
    requireAny: ["tornato", "tornata", "back", "qui", "rientro", "rientrato", "eccomi", "presente"],
  },
  resetTimer: {
    triggers: ["reset", "resetta", "azzera", "ricomincia", "da capo", "daccapo"],
    boostPhrases: ["reset timer", "resetta il timer", "ricomincia da capo", "azzera tutto"],
  },
};

function matchIntent(text) {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const wordSet = new Set(words);

  let bestAction = null;
  let bestScore = 0;
  let bestParam = null;

  for (const [action, def] of Object.entries(INTENT_DEFS)) {
    let score = 0;

    // Check trigger words
    for (const trigger of def.triggers) {
      if (trigger.includes(" ")) {
        if (normalized.includes(trigger)) score += 2;
      } else {
        if (wordSet.has(trigger)) score += 1;
        else if (normalized.includes(trigger)) score += 0.5;
      }
    }

    // Boost phrases (exact substring match = strong signal)
    if (def.boostPhrases) {
      for (const phrase of def.boostPhrases) {
        if (normalized.includes(phrase)) score += 3;
      }
    }

    // requireAny gate: at least one of these words must be present
    if (def.requireAny) {
      const hasRequired = def.requireAny.some(w =>
        w.includes(" ") ? normalized.includes(w) : wordSet.has(w) || normalized.includes(w)
      );
      if (!hasRequired) score = 0;
    }

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;

      // Extract parameter for addTask: everything after trigger words
      if (def.needsParam) {
        let param = normalized;
        // Remove common action verbs and noise words
        const removeWords = [
          "aggiungi", "nuova", "nuovo", "crea", "metti", "scrivi", "appunta",
          "segna", "ricordami", "add", "create", "task", "compito", "attività",
          "promemoria", "nota", "un", "una", "il", "la", "lo", "che", "di",
          "devo", "dovrei", "bisogna", "alle", "alla", "al", "to do", "todo",
        ];
        for (const w of removeWords) {
          param = param.replace(new RegExp(`\\b${w}\\b`, "gi"), "");
        }
        param = param.replace(/\s+/g, " ").trim();
        if (param) bestParam = param;
      }
    }
  }

  // Minimum score threshold to avoid false positives
  if (bestScore < 1) return null;

  return { action: bestAction, param: bestParam };
}

// ── Speech synthesis ────────────────────────────────────────────────
function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 1.1;
  utterance.volume = 0.7;
  window.speechSynthesis.speak(utterance);
}

// ── Action responses ────────────────────────────────────────────────
const ACTION_RESPONSES = {
  addTask: (p) => p ? `Task aggiunta: ${p}` : "Non ho capito il nome della task.",
  logMeal: () => "Pasto registrato!",
  startFocus: () => "Focus avviato!",
  pauseTimer: () => "In pausa.",
  resumeTimer: () => "Ripreso!",
  switchRelax: () => "Modalità relax.",
  switchFocus: () => "Torna al focus.",
  startBreathing: () => "Sessione di respirazione.",
  goAway: () => "Stato: via dalla scrivania.",
  comeBack: () => "Bentornato!",
  resetTimer: () => "Timer resettato.",
};

// ── Component ───────────────────────────────────────────────────────
export default function VoiceAssistant({ actions }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef(null);

  const handleResult = useCallback((text) => {
    const intent = matchIntent(text);
    if (!intent) {
      setFeedback("Non ho capito. Riprova.");
      speak("Non ho capito, puoi ripetere?");
      setTimeout(() => setFeedback(""), 2500);
      return;
    }

    const { action, param } = intent;
    const handler = actions[action];

    if (action === "addTask") {
      if (param && handler) {
        handler(param);
      } else {
        setFeedback("Non ho capito cosa aggiungere.");
        speak("Non ho capito cosa aggiungere.");
        setTimeout(() => setFeedback(""), 2500);
        return;
      }
    } else if (handler) {
      handler();
    }

    const msg = ACTION_RESPONSES[action]?.(param) || "Fatto!";
    setFeedback(msg);
    speak(msg);
    toast.success(msg);
    setTimeout(() => setFeedback(""), 3000);
  }, [actions]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error("Il tuo browser non supporta il riconoscimento vocale.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        handleResult(text);
        setTimeout(() => {
          setIsListening(false);
          setTranscript("");
        }, 1500);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("[Voice] error:", event.error);
      }
      setIsListening(false);
      setTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setFeedback("");
  }, [handleResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript("");
  }, []);

  if (!SpeechRecognition) return null;

  return (
    <>
      {/* Floating mic button */}
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isListening
            ? "bg-red-500 hover:bg-red-400 shadow-red-500/30"
            : "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-violet-500/20"
        }`}
        whileTap={{ scale: 0.9 }}
        aria-label={isListening ? "Stop listening" : "Voice command"}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </motion.button>

      {/* Transcript overlay */}
      <AnimatePresence>
        {(isListening || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              {isListening && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">Ascolto...</span>
                  </div>
                  <button onClick={stopListening} className="ml-auto text-white/30 hover:text-white/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {transcript && (
                <p className="text-white text-sm">{transcript}</p>
              )}
              {feedback && !transcript && (
                <p className="text-cyan-400 text-sm font-medium">{feedback}</p>
              )}
              {isListening && !transcript && !feedback && (
                <p className="text-white/40 text-xs">Parla naturalmente — ad esempio "metti su la musica", "scrivi che devo chiamare Marco", "ho mangiato"...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
