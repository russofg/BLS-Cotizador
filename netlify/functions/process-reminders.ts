import { ReminderAutomationService } from "../../src/services/ReminderAutomationService";

type ScheduledHandlerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export const config = {
  schedule: "0 * * * *", // cada hora, en punto
};

export async function handler(): Promise<ScheduledHandlerResponse> {
  const summary = await ReminderAutomationService.processDueRemindersOnce();
  const statusCode = summary.status === "error" ? 500 : 200;

  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(summary),
  };
}
