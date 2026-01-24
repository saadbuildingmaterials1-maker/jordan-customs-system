import { resourceMonitor } from "./resource-monitor";

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: number;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    memory: boolean;
    cpu: boolean;
    database: boolean;
    api: boolean;
  };
  details: string[];
}

class HealthChecker {
  private static instance: HealthChecker;
  private startTime = Date.now();
  private lastCheckTime = 0;
  private checkInterval = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  /**
   * Check memory health
   */
  private checkMemory(): { healthy: boolean; message: string } {
    const stats = resourceMonitor.getStats();
    const memMB = stats.memory.heapUsed / 1024 / 1024;
    const percentage = stats.memory.percentage;

    if (memMB > 400) {
      return {
        healthy: false,
        message: `Critical memory usage: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`,
      };
    } else if (memMB > 300) {
      return {
        healthy: true,
        message: `High memory usage: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`,
      };
    }

    return {
      healthy: true,
      message: `Memory OK: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`,
    };
  }

  /**
   * Check CPU health
   */
  private checkCpu(): { healthy: boolean; message: string } {
    // CPU check is basic - just ensure process is responding
    try {
      const uptime = process.uptime();
      return {
        healthy: true,
        message: `CPU OK: Process uptime ${uptime.toFixed(0)}s`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `CPU check failed: ${error}`,
      };
    }
  }

  /**
   * Check database health (placeholder)
   */
  private checkDatabase(): { healthy: boolean; message: string } {
    // This is a placeholder - implement actual DB check if needed
    return {
      healthy: true,
      message: "Database: Not checked",
    };
  }

  /**
   * Check API health (placeholder)
   */
  private checkApi(): { healthy: boolean; message: string } {
    // This is a placeholder - implement actual API check if needed
    return {
      healthy: true,
      message: "API: Not checked",
    };
  }

  /**
   * Perform full health check
   */
  performCheck(): HealthCheckResult {
    const stats = resourceMonitor.getStats();
    const memoryCheck = this.checkMemory();
    const cpuCheck = this.checkCpu();
    const dbCheck = this.checkDatabase();
    const apiCheck = this.checkApi();

    const details: string[] = [];
    details.push(memoryCheck.message);
    details.push(cpuCheck.message);
    details.push(dbCheck.message);
    details.push(apiCheck.message);

    const allHealthy =
      memoryCheck.healthy && cpuCheck.healthy && dbCheck.healthy && apiCheck.healthy;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (!memoryCheck.healthy || !cpuCheck.healthy) {
      status = "unhealthy";
    } else if (
      stats.memory.heapUsed / stats.memory.heapTotal > 0.8 ||
      stats.memory.percentage > 50
    ) {
      status = "degraded";
    }

    return {
      status,
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: {
        used: stats.memory.heapUsed,
        total: stats.memory.heapTotal,
        percentage: stats.memory.percentage,
      },
      checks: {
        memory: memoryCheck.healthy,
        cpu: cpuCheck.healthy,
        database: dbCheck.healthy,
        api: apiCheck.healthy,
      },
      details,
    };
  }

  /**
   * Start periodic health checks
   */
  start(callback?: (result: HealthCheckResult) => void): void {
    if (this.intervalId) {
      console.warn("[HealthChecker] Already running");
      return;
    }

    console.log("[HealthChecker] Starting health checks...");

    this.intervalId = setInterval(() => {
      const result = this.performCheck();
      this.lastCheckTime = Date.now();

      const statusEmoji = {
        healthy: "✅",
        degraded: "⚠️",
        unhealthy: "❌",
      };

      console.log(
        `${statusEmoji[result.status]} [HealthCheck] Status: ${result.status} | Memory: ${(result.memory.used / 1024 / 1024).toFixed(0)}MB / ${(result.memory.total / 1024 / 1024).toFixed(0)}MB`
      );

      if (callback) {
        callback(result);
      }
    }, this.checkInterval);
  }

  /**
   * Stop periodic health checks
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[HealthChecker] Stopped health checks");
    }
  }

  /**
   * Get last check time
   */
  getLastCheckTime(): number {
    return this.lastCheckTime;
  }

  /**
   * Get server uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

export const healthChecker = HealthChecker.getInstance();
