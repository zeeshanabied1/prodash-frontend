
import type { Config } from "@netlify/functions";
import { eq, isNull, desc } from "drizzle-orm";
import { db } from "../../src/lib/server/db";
import { projects } from "../../src/lib/server/schema";

export default async function handler(request: Request) {
   try {
      // GET /api/projects
      if (request.method === "GET") {
         const result = await db
            .select()
            .from(projects)
            .where(isNull(projects.deletedAt))
            .orderBy(desc(projects.createdAt));

         return Response.json({
            success: true,
            data: result,
         });
      }

      // POST /api/projects
      if (request.method === "POST") {
         const body = await request.json();

         if (!body.name || typeof body.name !== "string") {
            return Response.json(
               { success: false, message: "Project name is required." },
               { status: 400 }
            );
         }

         const project = {
            id: crypto.randomUUID(),
            name: body.name.trim(),
            description: body.description ?? null,
            color: body.color ?? "#64748b",
            icon: body.icon ?? "folder",
            status: "active" as const,
            startDate: body.startDate ?? null,
            dueDate: body.dueDate ?? null,
         };

         await db.insert(projects).values(project);

         return Response.json(
            { success: true, data: project },
            { status: 201 }
         );
      }

      return Response.json(
         { success: false, message: "Method not allowed." },
         { status: 405 }
      );
   } catch (error) {
      console.error("Projects API error:", error);

      return Response.json(
         { success: false, message: "Internal server error." },
         { status: 500 }
      );
   }
}

export const config: Config = {
   path: "/api/projects",
};
