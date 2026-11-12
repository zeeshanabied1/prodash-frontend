const API_URL = "/api/daily-schedules";

export interface DailySchedule {
   id: string;
   entry_date: string;
   wake_up_time: string;
   sleep_time: string;
   created_at: string;
   updated_at: string;
   deleted_at: string | null;
}

interface ApiResponse<T> {
   data?: T;
   error?: string;
   message?: string;
}

async function request<T>(
   url: string,
   options?: RequestInit
): Promise<T> {
   const response = await fetch(url, {
      headers: {
         "Content-Type": "application/json",
         ...options?.headers,
      },
      ...options,
   });

   const result: ApiResponse<T> = await response.json();

   if (!response.ok) {
      throw new Error(result.error || "Something went wrong.");
   }

   return result as T;
}

// READ
export async function getDailySchedule(date: string) {
   return request<{ data: DailySchedule | null }>(
      `${API_URL}?date=${encodeURIComponent(date)}`
   );
}

// CREATE
export async function createDailySchedule(payload: {
   entry_date: string;
   wake_up_time: string;
   sleep_time: string;
}) {
   return request<{ data: DailySchedule }>(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
   });
}

// UPDATE
export async function updateDailySchedule(payload: {
   id: string;
   wake_up_time: string;
   sleep_time: string;
}) {
   return request<{ data: DailySchedule }>(API_URL, {
      method: "PUT",
      body: JSON.stringify(payload),
   });
}

// DELETE
export async function deleteDailySchedule(id: string) {
   return request<{ message: string }>(
      `${API_URL}?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
   );
}