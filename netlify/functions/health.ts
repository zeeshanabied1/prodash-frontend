export default async function handler() {
   return Response.json({
      success: true,
      application: "ProDash API",
      status: "healthy",
      timestamp: new Date().toISOString(),
   });
}