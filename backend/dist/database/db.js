import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const dbPath = process.env.DATABASE_PATH ?? "./database.sqlite";
export const db = new Database(dbPath);
export function runMigrations() {
    const migrationPath = resolve(process.cwd(), "src/database/migrations/init.sql");
    const sql = readFileSync(migrationPath, "utf8");
    db.exec(sql);
}
