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

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ title, description });
      }}
      style={{ display: "grid", gap: 12 }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название привычки"
        required
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
      />
      <button type="submit" style={{
        background: "var(--tg-theme-button-color, #2563eb)",
        color: "var(--tg-theme-button-text-color, #fff)",
        border: "none",
        padding: "13px",
        fontWeight: 600,
        fontSize: "16px",
        borderRadius: "12px"
      }}>
        {submitLabel}
      </button>
    </form>
  );
}
