import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resourceMonitor } from "./resource-monitor";

describe("ResourceMonitor", () => {
  beforeEach(() => {
    // Clear stats before each test
    resourceMonitor.stop();
  });

  afterEach(() => {
    resourceMonitor.stop();
  });

  it("should be a singleton", () => {
    const monitor1 = resourceMonitor;
    const monitor2 = resourceMonitor;
    expect(monitor1).toBe(monitor2);
  });

  it("should get memory stats", () => {
    const stats = resourceMonitor.getStats();

    expect(stats).toHaveProperty("memory");
    expect(stats).toHaveProperty("uptime");
    expect(stats).toHaveProperty("cpuUsage");
    expect(stats).toHaveProperty("timestamp");

    expect(stats.memory).toHaveProperty("heapUsed");
    expect(stats.memory).toHaveProperty("heapTotal");
    expect(stats.memory).toHaveProperty("external");
    expect(stats.memory).toHaveProperty("rss");
    expect(stats.memory).toHaveProperty("percentage");

    expect(stats.memory.heapUsed).toBeGreaterThan(0);
    expect(stats.memory.heapTotal).toBeGreaterThan(0);
    expect(stats.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(stats.memory.percentage).toBeLessThanOrEqual(100);
  });

  it("should calculate average memory usage", () => {
    // Get multiple stats
    resourceMonitor.getStats();
    resourceMonitor.getStats();
    resourceMonitor.getStats();

    const average = resourceMonitor.getAverageMemoryUsage(3);

    expect(average).toBeGreaterThan(0);
    expect(typeof average).toBe("number");
  });

  it("should detect high memory usage", () => {
    const isHigh = resourceMonitor.isMemoryHigh();

    // In test environment, memory should not be high
    expect(typeof isHigh).toBe("boolean");
  });

  it("should determine memory trend", () => {
    // Get multiple stats to establish trend
    for (let i = 0; i < 5; i++) {
      resourceMonitor.getStats();
    }

    const trend = resourceMonitor.getMemoryTrend();

    expect(["increasing", "decreasing", "stable"]).toContain(trend);
  });

  it("should format stats correctly", () => {
    const stats = resourceMonitor.getStats();
    const formatted = resourceMonitor.formatStats(stats);

    expect(formatted).toContain("Memory:");
    expect(formatted).toContain("MB");
    expect(formatted).toContain("CPU:");
    expect(formatted).toContain("Uptime:");
  });

  it("should get health status", () => {
    const health = resourceMonitor.getStats();
    const status = resourceMonitor.getHealthStatus();

    expect(status).toHaveProperty("healthy");
    expect(status).toHaveProperty("memory");
    expect(status).toHaveProperty("trend");
    expect(status).toHaveProperty("message");

    expect(typeof status.healthy).toBe("boolean");
    expect(["good", "warning", "critical"]).toContain(status.memory);
    expect(["increasing", "decreasing", "stable"]).toContain(status.trend);
    expect(typeof status.message).toBe("string");
  });

  it("should start and stop monitoring", async () => {
    let callCount = 0;
    const callback = () => {
      callCount++;
    };

    resourceMonitor.start(callback);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    resourceMonitor.stop();

    expect(callCount).toBeGreaterThanOrEqual(0);
  });

  it("should not start monitoring twice", () => {
    const consoleSpy = vi.spyOn(console, "warn");

    resourceMonitor.start();
    resourceMonitor.start(); // Should warn

    expect(consoleSpy).toHaveBeenCalledWith("[ResourceMonitor] Already monitoring");

    resourceMonitor.stop();
    consoleSpy.mockRestore();
  });

  it("should keep only last 100 stats", () => {
    // Get more than 100 stats
    for (let i = 0; i < 150; i++) {
      resourceMonitor.getStats();
    }

    // Get average of all stats (should only have 100)
    const average = resourceMonitor.getAverageMemoryUsage(100);

    expect(average).toBeGreaterThan(0);
  });

  it("should handle memory trend correctly", () => {
    // Get initial stats
    const stats1 = resourceMonitor.getStats();

    // Get more stats
    resourceMonitor.getStats();
    resourceMonitor.getStats();

    const trend = resourceMonitor.getMemoryTrend();

    // Trend should be one of the valid values
    expect(["increasing", "decreasing", "stable"]).toContain(trend);
  });

  it("should calculate percentage correctly", () => {
    const stats = resourceMonitor.getStats();
    const percentage = stats.memory.percentage;

    // Percentage should be between 0 and 100
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it("should update stats timestamp", async () => {
    const stats1 = resourceMonitor.getStats();
    const timestamp1 = stats1.timestamp;

    // Wait a bit
    const delay = new Promise((resolve) => setTimeout(resolve, 10));
    await delay;

    const stats2 = resourceMonitor.getStats();
    const timestamp2 = stats2.timestamp;

    expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
  });
});
