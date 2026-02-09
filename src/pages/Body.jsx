import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";

const EXERCISES = [
  "Neck Retraction",
  "Shoulder Stretch",
  "Hip Rotation",
  "Wrist Flexion",
  "Spine Extension",
  "Chest Stretch",
  "Ankle Mobility",
  "Hip Flexor Stretch",
  "Neck Rotation",
  "Light Squat",
];

export default function Body() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const session = sessions[0] || null;
  const userSettings = settings[0] || {};
  const [breaksTarget, setBreaksTarget] = useState(session?.body_breaks_target || 6);
  const [morningBreaks, setMorningBreaks] = useState(3);
  const [afternoonBreaks, setAfternoonBreaks] = useState(3);

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return base44.entities.DaySession.update(session.id, data);
      }
      return base44.entities.DaySession.create({ ...data, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      toast.success("Body break schedule updated");
    },
  });

  const generateSchedule = () => {
    const schedule = [];
    const morningStart = userSettings.morning_work_start || "10:00";
    const morningEnd = userSettings.morning_work_end || "14:00";
    const afternoonStart = userSettings.afternoon_work_start || "15:00";
    const afternoonEnd = userSettings.afternoon_work_end || "19:00";

    const parseTime = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const formatTime = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const morningDuration = parseTime(morningEnd) - parseTime(morningStart);
    const morningInterval = morningDuration / (morningBreaks + 1);
    for (let i = 1; i <= morningBreaks; i++) {
      const time = parseTime(morningStart) + morningInterval * i;
      schedule.push({
        time: formatTime(time),
        focus: EXERCISES[schedule.length % EXERCISES.length],
        period: "Morning",
      });
    }

    const afternoonDuration = parseTime(afternoonEnd) - parseTime(afternoonStart);
    const afternoonInterval = afternoonDuration / (afternoonBreaks + 1);
    for (let i = 1; i <= afternoonBreaks; i++) {
      const time = parseTime(afternoonStart) + afternoonInterval * i;
      schedule.push({
        time: formatTime(time),
        focus: EXERCISES[schedule.length % EXERCISES.length],
        period: "Afternoon",
      });
    }

    return schedule;
  };

  const handleSave = () => {
    const schedule = generateSchedule();
    updateSession.mutate({
      body_breaks_target: morningBreaks + afternoonBreaks,
      body_break_schedule: schedule,
    });
  };

  const schedule = session?.body_break_schedule || generateSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Body Breaks</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Break Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white/70">Morning Breaks</Label>
                  <span className="text-xl font-bold text-orange-400">{morningBreaks}</span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMorningBreaks(n)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        morningBreaks === n
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white/70">Afternoon Breaks</Label>
                  <span className="text-xl font-bold text-orange-400">{afternoonBreaks}</span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setAfternoonBreaks(n)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        afternoonBreaks === n
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mt-4">
                <p className="text-orange-300 text-sm">
                  <strong>{morningBreaks + afternoonBreaks} total breaks</strong> scheduled for today
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold">Suggested Schedule</h2>
            </div>
            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{item.period}</p>
                    <p className="text-white font-medium">{item.focus}</p>
                  </div>
                  <div className="text-orange-400 font-semibold">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Optimal Break Strategy</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              For an 8-hour workday, we recommend 6 breaks (3 morning + 3 afternoon). This averages to one break
              every ~80 minutes, helping maintain mobility and prevent strain without disrupting deep work sessions.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateSession.isPending}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400"
          >
            Save Break Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}