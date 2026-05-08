export function requireBodyFields(fields) {
    return (req, res, next) => {
        const missing = fields.filter((field) => req.body?.[field] === undefined || req.body?.[field] === "");
        if (missing.length) {
            res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
            return;
        }
        next();
    };
}
