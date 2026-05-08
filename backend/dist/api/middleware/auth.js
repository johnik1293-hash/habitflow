export function authByTelegramHeader(req, res, next) {
    const telegramId = req.header("x-telegram-id");
    if (!telegramId) {
        res.status(401).json({ error: "x-telegram-id header is required" });
        return;
    }
    next();
}
