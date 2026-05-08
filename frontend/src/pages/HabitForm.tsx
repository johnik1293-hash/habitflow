import { HabitForm as HabitFormComponent } from "../components/HabitForm";
import type { Habit } from "../types";

export function HabitFormPage({
  onCreate,
  onBack
}: {
  onCreate: (draft: Partial<Habit>) => Promise<void>;
  onBack: () => void;
}) {
  return (
    <section>
      <button onClick={onBack}>← Назад</button>
      <h2>Новая привычка</h2>
      <HabitFormComponent submitLabel="Сохранить" onSubmit={onCreate} />
    </section>
  );
}

