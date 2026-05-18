import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

// Intent patterns: [regex, action key, extract group index (optional)]
const INTENTS = [
  // Tasks
  [/(?:aggiungi|nuova?|crea|add)\s*(?:task|compito|attività)\s+(.+)/i, "addTask", 1],
  [/(?:aggiungi|nuova?|crea|add)\s+(.+)\s+(?:alla lista|alle task|ai compiti|to list)/i, "addTask", 1],
  // Meals
  [/(?:aggiungi|registra|log)\s*(?:pasto|meal|pranzo|cena|colazione|snack)/i, "logMeal"],
  [/(?:ho (?:mangiato|pranzato|cenato))/i, "logMeal"],
  // Timer / Audio
  [/(?:avvia|parti|start|play)\s*(?:audio|musica|music|focus|timer|sessione)/i, "startFocus"],
  [/(?:metti|avvia)\s*(?:la\s+)?musica/i, "startFocus"],
  [/(?:pausa|pause|stop|ferma|stoppa)\s*(?:audio|musica|music|timer|tutto)?/i, "pauseTimer"],
  [/(?:riprendi|resume|continua)\s*(?:audio|musica|timer)?/i, "resumeTimer"],
  // Relax
  [/(?:relax|rilassati|rilassa|chill|decompression)/i, "switchRelax"],
  [/(?:torna|back|switch)\s*(?:a|to)?\s*(?:focus|lavoro|work)/i, "switchFocus"],
  // Breathing
  [/(?:respirazione|breathing|respira|breath)/i, "startBreathing"],
  // Away / Desk
  [/(?:sono\s+(?:via|away)|vado\s+via|me ne vado|going away)/i, "goAway"],
  [/(?:sono\s+(?:tornato|qui|back)|torno|i'?m back)/i, "comeBack"],
  // Reset
  [/(?:reset|resetta|ricomincia)\s*(?:timer)?/i, "resetTimer"],
];

function matchIntent(text) {
  const normalized = text.toLowerCase().trim();
  for (const [pattern, action, groupIdx] of INTENTS) {
    const match = normalized.match(pattern);
    if (match) {
      return { action, param: groupIdx ? match[groupIdx]?.trim() : null };
    }
  }
  return null;
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 1.1;
  utterance.volume = 0.7;
  window.speechSynthesis.speak(utterance);
}

export default function VoiceAssistant({ actions }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef(null);

  const handleResult = useCallback((text) => {
    const intent = matchIntent(text);
    if (!intent) {
      setFeedback("Non ho capito. Riprova.");
      speak("Non ho capito.");
      setTimeout(() => setFeedback(""), 2000);
      return;
    }

    const { action, param } = intent;
    let msg = "";

    switch (action) {
      case "addTask":
        if (param && actions.addTask) {
          actions.addTask(param);
          msg = `Task aggiunta: ${param}`;
        } else {
          msg = "Non ho capito il nome della task.";
        }
        break;
      case "logMeal":
        if (actions.logMeal) {
          actions.logMeal();
          msg = "Pasto registrato!";
        }
        break;
      case "startFocus":
        if (actions.startFocus) {
          actions.startFocus();
          msg = "Focus avviato!";
        }
        break;
      case "pauseTimer":
        if (actions.pauseTimer) {
          actions.pauseTimer();
          msg = "In pausa.";
        }
        break;
      case "resumeTimer":
        if (actions.resumeTimer) {
          actions.resumeTimer();
          msg = "Ripreso!";
        }
        break;
      case "switchRelax":
        if (actions.switchRelax) {
          actions.switchRelax();
          msg = "Modalità relax.";
        }
        break;
      case "switchFocus":
        if (actions.switchFocus) {
          actions.switchFocus();
          msg = "Torna al focus.";
        }
        break;
      case "startBreathing":
        if (actions.startBreathing) {
          actions.startBreathing();
          msg = "Sessione di respirazione.";
        }
        break;
      case "goAway":
        if (actions.goAway) {
          actions.goAway();
          msg = "Stato: via dalla scrivania.";
        }
        break;
      case "comeBack":
        if (actions.comeBack) {
          actions.comeBack();
          msg = "Bentornato!";
        }
        break;
      case "resetTimer":
        if (actions.resetTimer) {
          actions.resetTimer();
          msg = "Timer resettato.";
        }
        break;
      default:
        msg = "Comando non supportato.";
    }

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
                <p className="text-white/40 text-xs">Dì un comando: "aggiungi task...", "avvia musica", "registra pasto"...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
