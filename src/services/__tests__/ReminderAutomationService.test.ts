import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const whereMock = vi.fn(() => ({ get: getMock }));
const updateMock = vi.fn();
const docMock = vi.fn(() => ({ update: updateMock }));
const collectionMock = vi.fn(() => ({ where: whereMock, doc: docMock }));

const configureMock = vi.fn();
const sendReminderEmailMock = vi.fn();
const getEmailNotificationUsersMock = vi.fn();
const getSmtpRuntimeConfigMock = vi.fn();
const getSmtpRuntimeLogContextMock = vi.fn();

class MockSmtpConfigError extends Error {
  readonly missingKeys: string[];
  readonly invalidKeys: string[];

  constructor(
    message: string,
    {
      missingKeys = [],
      invalidKeys = [],
    }: {
      missingKeys?: string[];
      invalidKeys?: string[];
    } = {}
  ) {
    super(message);
    this.name = "SmtpConfigError";
    this.missingKeys = missingKeys;
    this.invalidKeys = invalidKeys;
  }
}

vi.mock("../../utils/firebaseAdmin", () => ({
  adminDb: {
    collection: collectionMock,
  },
}));

vi.mock("../RealEmailService", () => ({
  RealEmailService: {
    configure: configureMock,
    sendReminderEmail: sendReminderEmailMock,
  },
}));

vi.mock("../UserManagementService", () => ({
  UserManagementService: {
    getEmailNotificationUsers: getEmailNotificationUsersMock,
  },
}));

vi.mock("../SmtpRuntimeConfig", () => ({
  SmtpConfigError: MockSmtpConfigError,
  getSmtpRuntimeConfig: getSmtpRuntimeConfigMock,
  getSmtpRuntimeLogContext: getSmtpRuntimeLogContextMock,
}));

function createSnapshotDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: () => data,
  };
}

async function loadService() {
  const module = await import("../ReminderAutomationService");
  return module.ReminderAutomationService;
}

describe("ReminderAutomationService.processDueRemindersOnce", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    getSmtpRuntimeConfigMock.mockReturnValue({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "bot@example.com",
        pass: "secret",
      },
    });

    getSmtpRuntimeLogContextMock.mockReturnValue({
      configured: true,
      host: "smtp.example.com",
      port: 587,
      secure: false,
      user: "b***@example.com",
      missingKeys: [],
      invalidKeys: [],
    });

    getMock.mockResolvedValue({ docs: [] });
    sendReminderEmailMock.mockResolvedValue(true);
    getEmailNotificationUsersMock.mockResolvedValue([]);
    updateMock.mockResolvedValue(undefined);
  });

  it("usa destinatarios guardados y limpia el recordatorio si al menos un envío sale bien", async () => {
    getMock.mockResolvedValue({
      docs: [
        createSnapshotDoc("quote-1", {
          numero: "COT-001",
          clienteNombre: "Cliente Demo",
          proximoSeguimiento: { seconds: 1_700_000_000 },
          proximoSeguimientoTipo: "seguimiento",
          proximoSeguimientoMensaje: "Llamar mañana",
          proximoSeguimientoEmail: true,
          proximoSeguimientoDestinatarios: [
            "uno@example.com",
            " DOS@EXAMPLE.COM ",
            "uno@example.com",
          ],
        }),
      ],
    });

    const ReminderAutomationService = await loadService();
    const summary = await ReminderAutomationService.processDueRemindersOnce(
      new Date("2024-01-01T00:00:00.000Z")
    );

    expect(collectionMock).toHaveBeenCalledWith("cotizaciones");
    expect(whereMock).toHaveBeenCalledWith("proximoSeguimientoEmail", "==", true);
    expect(sendReminderEmailMock).toHaveBeenCalledTimes(2);
    expect(sendReminderEmailMock).toHaveBeenNthCalledWith(
      1,
      "uno@example.com",
      "COT-001",
      "Cliente Demo",
      "Llamar mañana",
      expect.any(Date)
    );
    expect(sendReminderEmailMock).toHaveBeenNthCalledWith(
      2,
      "dos@example.com",
      "COT-001",
      "Cliente Demo",
      "Llamar mañana",
      expect.any(Date)
    );
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        proximoSeguimiento: null,
        proximoSeguimientoTipo: null,
        proximoSeguimientoMensaje: null,
        proximoSeguimientoEmail: false,
        proximoSeguimientoPush: false,
        proximoSeguimientoUsuario: null,
        proximoSeguimientoDestinatarios: null,
        updatedAt: expect.any(Date),
      })
    );
    expect(summary).toMatchObject({
      status: "processed",
      checkedCount: 1,
      dueCount: 1,
      processedCount: 1,
      skippedCount: 0,
      failedCount: 0,
    });
  });

  it("usa fallback a usuarios activos con notificaciones email cuando no hay destinatarios guardados", async () => {
    getMock.mockResolvedValue({
      docs: [
        createSnapshotDoc("quote-2", {
          numero: "COT-002",
          clienteNombre: "Cliente Fallback",
          proximoSeguimiento: { toDate: () => new Date("2024-01-01T00:00:00.000Z") },
          proximoSeguimientoTipo: "revision",
          proximoSeguimientoMensaje: "Revisar propuesta",
          proximoSeguimientoEmail: true,
          proximoSeguimientoDestinatarios: [],
        }),
      ],
    });
    getEmailNotificationUsersMock.mockResolvedValue([
      { email: "team.one@example.com" },
      { email: " TEAM.TWO@example.com " },
    ]);

    const ReminderAutomationService = await loadService();
    const summary = await ReminderAutomationService.processDueRemindersOnce(
      new Date("2024-01-01T00:05:00.000Z")
    );

    expect(getEmailNotificationUsersMock).toHaveBeenCalledTimes(1);
    expect(sendReminderEmailMock).toHaveBeenCalledTimes(2);
    expect(sendReminderEmailMock).toHaveBeenNthCalledWith(
      1,
      "team.one@example.com",
      "COT-002",
      "Cliente Fallback",
      "Revisar propuesta",
      expect.any(Date)
    );
    expect(sendReminderEmailMock).toHaveBeenNthCalledWith(
      2,
      "team.two@example.com",
      "COT-002",
      "Cliente Fallback",
      "Revisar propuesta",
      expect.any(Date)
    );
    expect(summary.processedCount).toBe(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it("mantiene el recordatorio pendiente cuando no se pudo enviar ningún email", async () => {
    getMock.mockResolvedValue({
      docs: [
        createSnapshotDoc("quote-3", {
          numero: "COT-003",
          clienteNombre: "Cliente Fallido",
          proximoSeguimiento: { seconds: 1_700_000_000 },
          proximoSeguimientoTipo: "vencimiento",
          proximoSeguimientoMensaje: "Vence hoy",
          proximoSeguimientoEmail: true,
          proximoSeguimientoDestinatarios: ["owner@example.com"],
        }),
      ],
    });
    sendReminderEmailMock.mockResolvedValue(false);

    const ReminderAutomationService = await loadService();
    const summary = await ReminderAutomationService.processDueRemindersOnce(
      new Date("2024-01-01T00:00:00.000Z")
    );

    expect(sendReminderEmailMock).toHaveBeenCalledTimes(1);
    expect(updateMock).not.toHaveBeenCalled();
    expect(summary).toMatchObject({
      status: "processed",
      processedCount: 0,
      failedCount: 1,
      skippedCount: 0,
    });
  });

  it("sale en modo fail-safe cuando falta configuración SMTP y no toca Firestore", async () => {
    configureMock.mockImplementation(() => {
      throw new MockSmtpConfigError("faltan variables", {
        missingKeys: ["SMTP_HOST"],
      });
    });
    getSmtpRuntimeLogContextMock.mockReturnValue({
      configured: false,
      host: null,
      port: null,
      secure: null,
      user: null,
      missingKeys: ["SMTP_HOST"],
      invalidKeys: [],
    });

    const ReminderAutomationService = await loadService();
    const summary = await ReminderAutomationService.processDueRemindersOnce(
      new Date("2024-01-01T00:00:00.000Z")
    );

    expect(collectionMock).not.toHaveBeenCalled();
    expect(sendReminderEmailMock).not.toHaveBeenCalled();
    expect(summary).toMatchObject({
      status: "skipped",
      reason: "smtp_not_configured",
      smtp: expect.objectContaining({
        configured: false,
        missingKeys: ["SMTP_HOST"],
      }),
    });
  });
});
