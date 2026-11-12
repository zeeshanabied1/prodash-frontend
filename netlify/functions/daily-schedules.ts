
import type { Config } from "@netlify/functions";
import { db } from "./lib/db";

const headers = {
   "Content-Type": "application/json",
};

function response(data: unknown, status = 200) {
   return new Response(JSON.stringify(data), {
      status,
      headers,
   });
}

function isValidDate(date: unknown): date is string {
   if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
   }

   const parsed = new Date(`${date}T00:00:00Z`);

   return !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date;
}

function isValidTime(time: unknown): time is string {
   return typeof time === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export default async (request: Request) => {
   try {
      const method = request.method;

      // GET: Fetch a schedule by date
      if (method === "GET") {
         const date = new URL(request.url).searchParams.get("date");

         if (!isValidDate(date)) {
            return response({ error: "A valid date is required (YYYY-MM-DD)." }, 400);
         }

         const result = await db.execute({
            sql: `
          SELECT *
          FROM daily_schedules
          WHERE entry_date = ?
            AND deleted_at IS NULL
          LIMIT 1
        `,
            args: [date],
         });

         return response({ data: result.rows[0] ?? null });
      }

      // POST: Create a schedule
      if (method === "POST") {
         const body = await request.json();

         const { entry_date, wake_up_time, sleep_time } = body;

         if (
            !isValidDate(entry_date) ||
            !isValidTime(wake_up_time) ||
            !isValidTime(sleep_time)
         ) {
            return response({
               error: "Valid entry_date, wake_up_time and sleep_time are required.",
            }, 400);
         }

         // Check whether a record already exists for this date.
         const existing = await db.execute({
            sql: `
          SELECT *
          FROM daily_schedules
          WHERE entry_date = ?
          LIMIT 1
        `,
            args: [entry_date],
         });

         const existingRow = existing.rows[0];

         if (existingRow && existingRow.deleted_at === null) {
            return response({
               error: "A schedule already exists for this date. Use PUT to update it.",
            }, 409);
         }

         if (existingRow) {
            // Restore a previously soft-deleted schedule.
            await db.execute({
               sql: `
            UPDATE daily_schedules
            SET wake_up_time = ?,
                sleep_time = ?,
                deleted_at = NULL,
                updated_at = datetime('now')
            WHERE id = ?
          `,
               args: [wake_up_time, sleep_time, existingRow.id],
            });

            const restored = await db.execute({
               sql: "SELECT * FROM daily_schedules WHERE id = ?",
               args: [existingRow.id],
            });

            return response({ data: restored.rows[0] }, 200);
         }

         const id = crypto.randomUUID();

         await db.execute({
            sql: `
          INSERT INTO daily_schedules (
            id,
            entry_date,
            wake_up_time,
            sleep_time
          )
          VALUES (?, ?, ?, ?)
        `,
            args: [id, entry_date, wake_up_time, sleep_time],
         });

         const created = await db.execute({
            sql: "SELECT * FROM daily_schedules WHERE id = ?",
            args: [id],
         });

         return response({ data: created.rows[0] }, 201);
      }

      // PUT: Update an existing schedule
      if (method === "PUT") {
         const body = await request.json();

         const { id, wake_up_time, sleep_time } = body;

         if (
            typeof id !== "string" ||
            !id.trim() ||
            !isValidTime(wake_up_time) ||
            !isValidTime(sleep_time)
         ) {
            return response({
               error: "A valid id, wake_up_time and sleep_time are required.",
            }, 400);
         }

         const result = await db.execute({
            sql: `
          UPDATE daily_schedules
          SET wake_up_time = ?,
              sleep_time = ?,
              updated_at = datetime('now')
          WHERE id = ?
            AND deleted_at IS NULL
        `,
            args: [wake_up_time, sleep_time, id],
         });

         if (result.rowsAffected === 0) {
            return response({ error: "Schedule not found." }, 404);
         }

         const updated = await db.execute({
            sql: "SELECT * FROM daily_schedules WHERE id = ?",
            args: [id],
         });

         return response({ data: updated.rows[0] });
      }

      // DELETE: Soft-delete a schedule
      if (method === "DELETE") {
         const id = new URL(request.url).searchParams.get("id");

         if (!id) {
            return response({ error: "Schedule id is required." }, 400);
         }

         const result = await db.execute({
            sql: `
          UPDATE daily_schedules
          SET deleted_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
            AND deleted_at IS NULL
        `,
            args: [id],
         });

         if (result.rowsAffected === 0) {
            return response({ error: "Schedule not found." }, 404);
         }

         return response({ message: "Schedule deleted successfully." });
      }

      return response({ error: "Method not allowed." }, 405);
   } catch (error) {
      console.error("Daily schedules API error:", error);

      return response({
         error: "An internal server error occurred.",
      }, 500);
   }
};

export const config: Config = {
   path: "/api/daily-schedules",
};
