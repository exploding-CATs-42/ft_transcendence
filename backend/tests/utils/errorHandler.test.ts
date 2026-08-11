import type { Socket } from "socket.io";
import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gameOperationTotal } from "../../src/metrics/gameOperationMetrics";
import { withErrorHandler } from "../../src/utils/errorHandler";

const schema = z.object({ value: z.string() });

async function getMetricValue(operation: string, status: string) {
  const metric = await gameOperationTotal.get();
  const sample = metric.values.find(
    (value) =>
      value.labels["operation"] === operation &&
      value.labels["status"] === status,
  );

  return sample?.value ?? 0;
}

describe("withErrorHandler game operation metrics", () => {
  const socket = { emit: vi.fn() } as unknown as Socket;

  beforeEach(() => {
    gameOperationTotal.reset();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("records a successful game operation", async () => {
    const event = vi.fn().mockResolvedValue(undefined);
    const handler = withErrorHandler(schema, socket, "draw-card-error", event);

    await handler({ value: "card" });

    expect(await getMetricValue("draw-card", "success")).toBe(1);
  });

  it("records invalid input as rejected", async () => {
    const event = vi.fn().mockResolvedValue(undefined);
    const handler = withErrorHandler(schema, socket, "play-card-error", event);

    await handler({ value: 42 });

    expect(await getMetricValue("play-card", "rejected")).toBe(1);
    expect(await getMetricValue("play-card", "server_error")).toBe(0);
  });

  it("records an unexpected exception as a server error", async () => {
    const event = vi.fn().mockRejectedValue(new Error("database unavailable"));
    const handler = withErrorHandler(schema, socket, "join-game-error", event);

    await handler({ value: "game" });

    expect(await getMetricValue("join-game", "server_error")).toBe(1);
  });
});
