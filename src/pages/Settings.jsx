import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const userSettings = settings[0] || {};
  const [formData, setFormData] = useState({
    display_name: userSettings.display_name || "",
    morning_work_start: userSettings.morning_work_start || "09:00",
    morning_work_end: userSettings.morning_work_end || "13:00",
    afternoon_work_start: userSettings.afternoon_work_start || "14:00",
    afternoon_work_end: userSettings.afternoon_work_end || "18:00",
    notifications_enabled: userSettings.notifications_enabled ?? true,
    notification_start_time: userSettings.notification_start_time || "09:00",
    notification_end_time: userSettings.notification_end_time || "18:00",
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (userSettings.id) {
        return base44.entities.UserSettings.update(userSettings.id, data);
      }
      return base44.entities.UserSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast.success("Settings saved");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  React.useEffect(() => {
    if (userSettings.id) {
      setFormData({
        display_name: userSettings.display_name || "",
        morning_work_start: userSettings.morning_work_start || "09:00",
        morning_work_end: userSettings.morning_work_end || "13:00",
        afternoon_work_start: userSettings.afternoon_work_start || "14:00",
        afternoon_work_end: userSettings.afternoon_work_end || "18:00",
        notifications_enabled: userSettings.notifications_enabled ?? true,
        notification_start_time: userSettings.notification_start_time || "09:00",
        notification_end_time: userSettings.notification_end_time || "18:00",
      });
    }
  }, [userSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Personal */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Personal</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white/70">Display Name</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
            </div>
          </div>

          {/* Work Hours */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Default Work Hours</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm">Morning Start</Label>
                  <Input
                    type="time"
                    value={formData.morning_work_start}
                    onChange={(e) => setFormData({ ...formData, morning_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Morning End</Label>
                  <Input
                    type="time"
                    value={formData.morning_work_end}
                    onChange={(e) => setFormData({ ...formData, morning_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm">Afternoon Start</Label>
                  <Input
                    type="time"
                    value={formData.afternoon_work_start}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Afternoon End</Label>
                  <Input
                    type="time"
                    value={formData.afternoon_work_end}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Enable Notifications</Label>
                <Switch
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
                />
              </div>
              {formData.notifications_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value={formData.notification_start_time}
                      onChange={(e) => setFormData({ ...formData, notification_start_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">End Time</Label>
                    <Input
                      type="time"
                      value={formData.notification_end_time}
                      onChange={(e) => setFormData({ ...formData, notification_end_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}