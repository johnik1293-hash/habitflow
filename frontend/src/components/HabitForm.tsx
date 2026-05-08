import { useState } from "react";
import type { Habit } from "../types";

type HabitDraft = Partial<Habit>;

export function HabitForm({
  initial,
  onSubmit,
  submitLabel
}: {
  initial?: HabitDraft;
  onSubmit: (draft: HabitDraft) => Promise<void> | void;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "⭐");
  const [reminderTime, setReminderTime] = useState(initial?.reminder_time ?? "09:00");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          title,
          description,
          emoji,
          reminder_time: reminderTime
        });
      }}
      style={{ display: "grid", gap: 8 }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название привычки" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Эмодзи" />
      <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

