// Maps a notification's (type, role) to the page/tab it should open when
// tapped — the "action" a WhatsApp-triggered event points back to inside
// the app. Kept as a pure function rather than a stored column: the view
// routing already lives client-side in Dashboard.tsx, and the mapping is
// small enough not to warrant a schema change or extra round trip.

import type { NotificationType } from "@/lib/types";

export type NotificationView = "browse" | "my-jobs" | "picked" | "tasks";
export type TaskTab = "confirm" | "work" | "review";

export interface NotificationTarget {
  view: NotificationView;
  taskTab?: TaskTab;
}

export function getNotificationTarget(
  type: NotificationType | string,
  role: "poster" | "picker",
): NotificationTarget | null {
  switch (type) {
    case "new_job_broadcast":
      // Picker-only event — take them to the map to see the open job.
      return { view: "browse" };
    case "interest_received":
    case "interest_reminder":
      // Poster-only events — the confirm action lives in Task list.
      return { view: "tasks", taskTab: "confirm" };
    case "job_confirmed":
      return role === "picker" ? { view: "tasks", taskTab: "work" } : { view: "my-jobs" };
    case "appointment_reminder_2h":
    case "appointment_reminder_30m":
      return role === "picker" ? { view: "tasks", taskTab: "work" } : { view: "my-jobs" };
    default:
      return null;
  }
}
