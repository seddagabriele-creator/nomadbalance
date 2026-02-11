import React from "react";
import { TimerProvider } from "./components/lib/TimerContext";

export default function Layout({ children }) {
  return (
    <TimerProvider>
      <div className="min-h-screen bg-slate-950">
        <style>{`
          :root {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
          }
          body {
            background: #020617;
            -webkit-font-smoothing: antialiased;
          }
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}</style>
        {children}
      </div>
    </TimerProvider>
  );
}