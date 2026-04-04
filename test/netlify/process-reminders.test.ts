import { beforeEach, describe, expect, it, vi } from "vitest";

const processDueRemindersOnceMock = vi.fn();

vi.mock("../../src/services/ReminderAutomationService", () => ({
  ReminderAutomationService: {
    processDueRemindersOnce: processDueRemindersOnceMock,
  },
}));

async function loadHandlerModule() {
  return import("../../netlify/functions/process-reminders");
}

describe("netlify scheduled function process-reminders", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("expone cron inline y responde 200 cuando el procesamiento termina sin error", async () => {
    processDueRemindersOnceMock.mockResolvedValue({
      status: "processed",
      checkedCount: 1,
      dueCount: 1,
      processedCount: 1,
      skippedCount: 0,
      failedCount: 0,
      startedAt: "2024-01-01T00:00:00.000Z",
      finishedAt: "2024-01-01T00:00:01.000Z",
    });

    const { config, handler } = await loadHandlerModule();
    const response = await handler();

    expect(config).toEqual({ schedule: "* * * * *" });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(response.body)).toMatchObject({
      status: "processed",
      processedCount: 1,
    });
  });

  it("propaga 500 cuando el servicio reporta error", async () => {
    processDueRemindersOnceMock.mockResolvedValue({
      status: "error",
      checkedCount: 0,
      dueCount: 0,
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      startedAt: "2024-01-01T00:00:00.000Z",
      finishedAt: "2024-01-01T00:00:01.000Z",
      reason: "boom",
    });

    const { handler } = await loadHandlerModule();
    const response = await handler();

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toMatchObject({
      status: "error",
      reason: "boom",
    });
  });
});
