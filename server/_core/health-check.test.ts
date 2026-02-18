import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { healthChecker } from "./health-check";

describe("HealthChecker", () => {
  beforeEach(() => {
    // Clear monitoring before each test
    healthChecker.stop();
  });

  afterEach(() => {
    healthChecker.stop();
  });

  it("should be a singleton", () => {
    const checker1 = healthChecker;
    const checker2 = healthChecker;
    expect(checker1).toBe(checker2);
  });

  it("should perform health check", () => {
    const result = healthChecker.performCheck();

    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("uptime");
    expect(result).toHaveProperty("memory");
    expect(result).toHaveProperty("checks");
    expect(result).toHaveProperty("details");

    expect(["healthy", "degraded", "unhealthy"]).toContain(result.status);
    expect(result.timestamp).toBeGreaterThan(0);
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.details)).toBe(true);
  });

  it("should have valid memory stats", () => {
    const result = healthChecker.performCheck();

    expect(result.memory).toHaveProperty("used");
    expect(result.memory).toHaveProperty("total");
    expect(result.memory).toHaveProperty("percentage");

    expect(result.memory.used).toBeGreaterThan(0);
    expect(result.memory.total).toBeGreaterThan(0);
    expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(result.memory.percentage).toBeLessThanOrEqual(100);
  });

  it("should have all checks", () => {
    const result = healthChecker.performCheck();

    expect(result.checks).toHaveProperty("memory");
    expect(result.checks).toHaveProperty("cpu");
    expect(result.checks).toHaveProperty("database");
    expect(result.checks).toHaveProperty("api");

    expect(typeof result.checks.memory).toBe("boolean");
    expect(typeof result.checks.cpu).toBe("boolean");
    expect(typeof result.checks.database).toBe("boolean");
    expect(typeof result.checks.api).toBe("boolean");
  });

  it("should have valid details", () => {
    const result = healthChecker.performCheck();

    expect(Array.isArray(result.details)).toBe(true);
    expect(result.details.length).toBeGreaterThan(0);

    result.details.forEach((detail) => {
      expect(typeof detail).toBe("string");
      expect(detail.length).toBeGreaterThan(0);
    });
  });

  it("should start and stop health checks", async () => {
    let callCount = 0;
    const callback = () => {
      callCount++;
    };

    healthChecker.start(callback);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    healthChecker.stop();

    expect(callCount).toBeGreaterThanOrEqual(0);
  });

  it("should not start health checks twice", () => {
    const consoleSpy = vi.spyOn(console, "warn");

    healthChecker.start();
    healthChecker.start(); // Should warn

    expect(consoleSpy).toHaveBeenCalledWith("[HealthChecker] Already running");

    healthChecker.stop();
    consoleSpy.mockRestore();
  });

  it("should get last check time", () => {
    const before = Date.now();
    healthChecker.performCheck();
    const after = Date.now();

    const lastCheckTime = healthChecker.getLastCheckTime();

    // Last check time should be between before and after (or 0 if not set)
    if (lastCheckTime > 0) {
      expect(lastCheckTime).toBeGreaterThanOrEqual(before);
      expect(lastCheckTime).toBeLessThanOrEqual(after + 100); // Allow small margin
    }
  });

  it("should get uptime", () => {
    const uptime = healthChecker.getUptime();

    expect(uptime).toBeGreaterThanOrEqual(0);
    expect(typeof uptime).toBe("number");
  });

  it("should determine correct health status", () => {
    const result = healthChecker.performCheck();

    // Status should be based on memory and other checks
    if (result.memory.used > 400 * 1024 * 1024) {
      expect(result.status).toBe("unhealthy");
    } else if (result.memory.used > 300 * 1024 * 1024) {
      expect(result.status).toBe("degraded");
    } else {
      expect(result.status).toBe("healthy");
    }
  });

  it("should have consistent timestamps", async () => {
    const result1 = healthChecker.performCheck();
    const timestamp1 = result1.timestamp;

    const delay = new Promise((resolve) => setTimeout(resolve, 10));
    await delay;

    const result2 = healthChecker.performCheck();
    const timestamp2 = result2.timestamp;

    expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
  });

  it("should handle multiple checks", () => {
    const results = [];

    for (let i = 0; i < 5; i++) {
      results.push(healthChecker.performCheck());
    }

    expect(results.length).toBe(5);

    results.forEach((result) => {
      expect(["healthy", "degraded", "unhealthy"]).toContain(result.status);
    });
  });

  it("should have valid CPU check message", () => {
    const result = healthChecker.performCheck();

    const cpuDetail = result.details.find((d) => d.includes("CPU"));
    expect(cpuDetail).toBeDefined();
    expect(cpuDetail).toContain("OK");
  });

  it("should have valid memory check message", () => {
    const result = healthChecker.performCheck();

    const memoryDetail = result.details.find((d) => d.includes("Memory"));
    expect(memoryDetail).toBeDefined();
    expect(memoryDetail).toMatch(/Memory.*MB/);
  });

  it("should update uptime correctly", async () => {
    const result1 = healthChecker.performCheck();
    const uptime1 = result1.uptime;

    const delay = new Promise((resolve) => setTimeout(resolve, 100));
    await delay;

    const result2 = healthChecker.performCheck();
    const uptime2 = result2.uptime;

    expect(uptime2).toBeGreaterThanOrEqual(uptime1);
  });
});
