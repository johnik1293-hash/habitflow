export function handleStart(firstName) {
    const name = firstName?.trim() || "друг";
    return `Привет, ${name}! Я HabitFlow. Нажми /newhabit чтобы создать первую привычку, или /app для открытия Mini App.`;
}
