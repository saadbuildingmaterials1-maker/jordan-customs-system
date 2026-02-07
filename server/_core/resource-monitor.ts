/**
 * resource-monitor
 * 
 * @module ./server/_core/resource-monitor
 */
import os from "os";

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  percentage: number;
}

interface ResourceStats {
  memory: MemoryStats;
  uptime: number;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: number;
}

class ResourceMonitor {
  private static instance: ResourceMonitor;
  private memoryThreshold = 500 * 1024 * 1024; // 500MB
  private checkInterval = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private stats: ResourceStats[] = [];
  private maxStats = 100; // Keep last 100 stats

  private constructor() {}

  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  /**
   * Get current memory statistics
   */
  private getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const percentage = (memUsage.heapUsed / totalMemory) * 100;

    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      percentage,
    };
  }

  /**
   * Get current resource statistics
   */
  getStats(): ResourceStats {
    const memory = this.getMemoryStats();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    const stats: ResourceStats = {
      memory,
      uptime,
      cpuUsage,
      timestamp: Date.now(),
    };

    // Keep only last 100 stats
    this.stats.push(stats);
    if (this.stats.length > this.maxStats) {
      this.stats.shift();
    }

    this.lastCpuUsage = cpuUsage;
    return stats;
  }

  /**
   * Get average memory usage from last N checks
   */
  getAverageMemoryUsage(count: number = 10): number {
    const recentStats = this.stats.slice(-count);
    if (recentStats.length === 0) return 0;

    const total = recentStats.reduce((sum, stat) => sum + stat.memory.heapUsed, 0);
    return total / recentStats.length;
  }

  /**
   * Check if memory usage is high
   */
  isMemoryHigh(): boolean {
    const memory = this.getMemoryStats();
    return memory.heapUsed > this.memoryThreshold;
  }

  /**
   * Get memory trend (increasing, decreasing, stable)
   */
  getMemoryTrend(): "increasing" | "decreasing" | "stable" {
    if (this.stats.length < 3) return "stable";

    const recent = this.stats.slice(-3);
    const values = recent.map((s) => s.memory.heapUsed);

    const diff1 = values[1] - values[0];
    const diff2 = values[2] - values[1];

    if (diff1 > 10 * 1024 * 1024 && diff2 > 10 * 1024 * 1024) {
      return "increasing";
    } else if (diff1 < -10 * 1024 * 1024 && diff2 < -10 * 1024 * 1024) {
      return "decreasing";
    }

    return "stable";
  }

  /**
   * Start monitoring resources
   */
  start(callback?: (stats: ResourceStats) => void): void {
    if (this.intervalId) {
      console.warn("[ResourceMonitor] Already monitoring");
      return;
    }

    console.log("[ResourceMonitor] Starting resource monitoring...");

    this.intervalId = setInterval(() => {
      const stats = this.getStats();
      const trend = this.getMemoryTrend();
      const isHigh = this.isMemoryHigh();

      const memMB = (stats.memory.heapUsed / 1024 / 1024).toFixed(2);
      const percentage = stats.memory.percentage.toFixed(2);

      let logLevel = "info";
      if (isHigh) logLevel = "warn";
      if (trend === "increasing") logLevel = "warn";

      const message = `[ResourceMonitor] Memory: ${memMB}MB (${percentage}%) | Trend: ${trend} | Uptime: ${stats.uptime.toFixed(0)}s`;

      if (logLevel === "warn") {
        console.warn(message);
      } else {
        console.log(message);
      }

      if (callback) {
        callback(stats);
      }

      // Force garbage collection if memory is too high
      if (isHigh && global.gc) {
        console.warn("[ResourceMonitor] Forcing garbage collection...");
        global.gc();
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring resources
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[ResourceMonitor] Stopped resource monitoring");
    }
  }

  /**
   * Get formatted stats for logging
   */
  formatStats(stats: ResourceStats): string {
    const memMB = (stats.memory.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (stats.memory.heapTotal / 1024 / 1024).toFixed(2);
    const rssMB = (stats.memory.rss / 1024 / 1024).toFixed(2);

    return `Memory: ${memMB}MB / ${heapTotalMB}MB (RSS: ${rssMB}MB) | CPU: ${stats.cpuUsage.user}us | Uptime: ${stats.uptime.toFixed(0)}s`;
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    healthy: boolean;
    memory: "good" | "warning" | "critical";
    trend: "increasing" | "decreasing" | "stable";
    message: string;
  } {
    const stats = this.getStats();
    const trend = this.getMemoryTrend();
    const memMB = stats.memory.heapUsed / 1024 / 1024;

    let memory: "good" | "warning" | "critical" = "good";
    if (memMB > 400) memory = "critical";
    else if (memMB > 300) memory = "warning";

    const healthy = memory !== "critical" && trend !== "increasing";

    return {
      healthy,
      memory,
      trend,
      message: `Memory: ${memMB.toFixed(0)}MB | Trend: ${trend}`,
    };
  }
}

export const resourceMonitor = ResourceMonitor.getInstance();
