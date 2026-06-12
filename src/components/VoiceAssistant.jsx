import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, X, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSubscription } from "@/lib/SubscriptionContext";
import { supabase } from "@/api/supabaseClient";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

// ── LLM intent classification ──────────────────────────────────────
async function classifyIntent(transcript) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch("/api/voice-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Local fallback (fuzzy matching) ────────────────────────────────
const INTENT_DEFS = {
  addTask: {
    triggers: ["task", "compito", "attività", "promemoria", "nota", "ricordami", "segna", "scrivi", "appunta", "aggiungi", "nuova", "nuovo", "crea", "metti", "to do", "todo"],
    needsParam: true,
  },
  logMeal: {
    triggers: ["pasto", "meal", "mangiato", "pranzo", "pranzato", "cena", "cenato", "colazione", "snack", "spuntino", "merenda", "mangio", "mangiare", "cibo", "food", "ho fame"],
  },
  startFocus: {
    triggers: ["musica", "music", "audio", "focus", "concentrazione", "suono", "suona", "play", "avvia", "parti", "start", "inizia", "comincia", "lavorare", "lavoro", "sessione", "accendi"],
    boostPhrases: ["metti musica", "avvia musica", "start focus", "voglio concentrarmi", "inizia a lavorare"],
  },
  pauseTimer: {
    triggers: ["pausa", "pause", "stop", "ferma", "fermati", "basta", "smetti", "aspetta"],
    boostPhrases: ["metti in pausa", "stop musica", "ferma tutto"],
  },
  resumeTimer: {
    triggers: ["riprendi", "resume", "continua", "vai", "go", "ricomincia", "avanti", "prosegui"],
    boostPhrases: ["riprendi la musica", "vai avanti", "continua il timer"],
  },
  switchRelax: {
    triggers: ["relax", "rilassati", "rilassa", "chill", "calma", "tranquillo", "stacca"],
    boostPhrases: ["voglio rilassarmi", "metti relax", "modalità relax"],
  },
  switchFocus: {
    triggers: ["focus", "concentrazione", "lavoro", "work", "produttivo", "torna"],
    boostPhrases: ["torna al focus", "torna a lavorare", "basta relax", "modalità lavoro"],
    requireAny: ["torna", "back", "basta", "modalità lavoro", "switch"],
  },
  startBreathing: {
    triggers: ["respirazione", "breathing", "respira", "breath", "respiro", "inspira", "espira"],
    boostPhrases: ["esercizio di respirazione", "facciamo respirazione"],
  },
  goAway: {
    triggers: ["via", "away", "vado", "esco", "allontano"],
    boostPhrases: ["sono via", "vado via", "me ne vado", "pausa pranzo", "mi allontano"],
    requireAny: ["via", "away", "vado", "esco", "allontano", "pausa pranzo"],
  },
  comeBack: {
    triggers: ["tornato", "back", "qui", "tornata", "presente", "rientro", "rientrato"],
    boostPhrases: ["sono tornato", "sono qui", "sono back", "eccomi"],
    requireAny: ["tornato", "tornata", "back", "qui", "rientro", "eccomi", "presente"],
  },
  resetTimer: {
    triggers: ["reset", "resetta", "azzera", "ricomincia", "da capo"],
    boostPhrases: ["reset timer", "resetta il timer", "ricomincia da capo"],
  },
};

function matchIntentLocal(text) {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const wordSet = new Set(words);

  let bestAction = null;
  let bestScore = 0;
  let bestParam = null;

  for (const [action, def] of Object.entries(INTENT_DEFS)) {
    let score = 0;

    for (const trigger of def.triggers) {
      if (trigger.includes(" ")) {
        if (normalized.includes(trigger)) score += 2;
      } else {
        if (wordSet.has(trigger)) score += 1;
        else if (normalized.includes(trigger)) score += 0.5;
      }
    }

    if (def.boostPhrases) {
      for (const phrase of def.boostPhrases) {
        if (normalized.includes(phrase)) score += 3;
      }
    }

    if (def.requireAny) {
      const hasRequired = def.requireAny.some(w =>
        w.includes(" ") ? normalized.includes(w) : wordSet.has(w) || normalized.includes(w)
      );
      if (!hasRequired) score = 0;
    }

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;

      if (def.needsParam) {
        let param = normalized;
        const removeWords = [
          "aggiungi", "nuova", "nuovo", "crea", "metti", "scrivi", "appunta",
          "segna", "ricordami", "task", "compito", "attività", "promemoria",
          "nota", "un", "una", "il", "la", "lo", "che", "di", "devo",
        ];
        for (const w of removeWords) {
          param = param.replace(new RegExp(`\\b${w}\\b`, "gi"), "");
        }
        param = param.replace(/\s+/g, " ").trim();
        if (param) bestParam = param;
      }
    }
  }

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
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const { isPro, promptUpgrade } = useSubscription();

  const handleResult = useCallback(async (text) => {
    setProcessing(true);
    setTranscript("");

    let intent = null;
    try {
      intent = await classifyIntent(text);
    } catch {
      intent = matchIntentLocal(text);
    }

    setProcessing(false);

    if (!intent?.action) {
      setFeedback("Non ho capito. Riprova.");
      speak("Non ho capito, puoi ripetere?");
      setTimeout(() => { setFeedback(""); }, 2500);
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
        setTimeout(() => { setFeedback(""); }, 2500);
        return;
      }
    } else if (handler) {
      handler();
    }

    const msg = ACTION_RESPONSES[action]?.(param) || "Fatto!";
    setFeedback(msg);
    speak(msg);
    toast.success(msg);
    setTimeout(() => { setFeedback(""); }, 3000);
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
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("[Voice] error:", event.error);
      }
      setIsListening(false);
      setTranscript("");
      setProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setFeedback("");
    setProcessing(false);
  }, [handleResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript("");
    setProcessing(false);
  }, []);

  if (!SpeechRecognition) return null;

  return (
    <>
      {/* Floating mic button — Pro feature (each command is an AI call).
          bottom-20 clears the AdBanner for free users; Pro users get
          bottom-6 since they have no banner. */}
      <motion.button
        onClick={!isPro ? promptUpgrade : isListening ? stopListening : startListening}
        className={`fixed ${isPro ? "bottom-6" : "bottom-20"} right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isListening
            ? "bg-red-500 hover:bg-red-400 shadow-red-500/30"
            : "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-violet-500/20"
        }`}
        whileTap={{ scale: 0.9 }}
        aria-label={!isPro ? "Voice assistant (Pro feature)" : isListening ? "Stop listening" : "Voice command"}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        {!isPro && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-violet-400/60 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-violet-300" />
          </span>
        )}
      </motion.button>

      {/* Transcript overlay */}
      <AnimatePresence>
        {(isListening || feedback || processing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${isPro ? "bottom-24" : "bottom-36"} left-4 right-4 z-50 max-w-sm mx-auto`}
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
              {processing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-cyan-400/70 text-xs">Sto elaborando...</span>
                </div>
              )}
              {transcript && !processing && (
                <p className="text-white text-sm">{transcript}</p>
              )}
              {feedback && !transcript && !processing && (
                <p className="text-cyan-400 text-sm font-medium">{feedback}</p>
              )}
              {isListening && !transcript && !feedback && !processing && (
                <p className="text-white/40 text-xs">Parla naturalmente — ad esempio &quot;metti su la musica&quot;, &quot;scrivi che devo chiamare Marco&quot;, &quot;ho mangiato&quot;...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
