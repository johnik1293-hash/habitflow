export function requireUserId(req, res) {
    const userIdHeader = req.header("x-user-id");
    const userId = Number(userIdHeader);
    if (!Number.isInteger(userId) || userId <= 0) {
        res.status(401).json({ error: "x-user-id header is required" });
        return null;
    }
    return userId;
}
export function todayDate() {
    return new Date().toISOString().slice(0, 10);
}
