export function handleInline(query) {
    if (query.includes("streak")) {
        return "Мой текущий streak в HabitFlow 🔥";
    }
    if (query.includes("progress")) {
        return "Мой прогресс привычки в HabitFlow 📈";
    }
    return "Inline: streak | progress";
}
