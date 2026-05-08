import "dotenv/config";
async function main() {
    const token = process.env.BOT_TOKEN;
    if (!token)
        throw new Error("BOT_TOKEN must be configured");
    const commands = [
        { command: "start", description: "Начать работу с HabitFlow" },
        { command: "habits", description: "Показать активные привычки" },
        { command: "newhabit", description: "Создать новую привычку" },
        { command: "stats", description: "Быстрая статистика" },
        { command: "app", description: "Открыть Mini App" }
    ];
    const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commands })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(`setMyCommands failed: ${JSON.stringify(data)}`);
    }
    console.log("Bot commands configured");
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
