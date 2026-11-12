import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { TimePicker } from "./components/ui/time-picker";
import { Settings } from "lucide-react";

import {
  getDailySchedule,
  createDailySchedule,
  updateDailySchedule,
  deleteDailySchedule,
  type DailySchedule,
} from "./services/dailySchedules";

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function App() {
  const [wupTime, setWupTime] = useState("03:30");
  const [sdnTime, setSdnTime] = useState("09:30");

  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const today = getLocalDate();

  // LOAD today's schedule
  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true);

        const result = await getDailySchedule(today);

        setSchedule(result.data);

        if (result.data) {
          setWupTime(result.data.wake_up_time);
          setSdnTime(result.data.sleep_time);
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Failed to load schedule."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [today]);

  // FORMAT TIME
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  // CREATE OR UPDATE
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      if (schedule) {
        const result = await updateDailySchedule({
          id: schedule.id,
          wake_up_time: wupTime,
          sleep_time: sdnTime,
        });

        setSchedule(result.data);
      } else {
        const result = await createDailySchedule({
          entry_date: today,
          wake_up_time: wupTime,
          sleep_time: sdnTime,
        });

        setSchedule(result.data);
      }

      setMessage("Schedule saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!schedule) return;

    try {
      setSaving(true);
      setMessage("");

      await deleteDailySchedule(schedule.id);

      setSchedule(null);
      setWupTime("03:30");
      setSdnTime("09:30");

      setMessage("Schedule deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="m-2.5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            W-up:
            <TimePicker value={wupTime} onChange={setWupTime} />
            <span>{formatTime(wupTime)}</span>
          </div>

          <div className="flex items-center gap-2">
            S-dn:
            <TimePicker value={sdnTime} onChange={setSdnTime} />
            <span>{formatTime(sdnTime)}</span>
          </div>
        </div>

        <Button variant="outline" size="icon">
          <Settings />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving
            ? "Saving..."
            : schedule
            ? "Update Schedule"
            : "Save Schedule"}
        </Button>

        {schedule && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || saving}
          >
            Delete
          </Button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading schedule...</p>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </section>
  );
}

export default App;
