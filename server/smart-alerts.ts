/**
 * Smart Alerts System with Machine Learning
 * Predicts price changes and sends intelligent alerts
 */

interface PriceHistory {
  date: string;
  price: number;
  country: string;
}

interface PriceAlert {
  id: string;
  country: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  recommendation: string;
  timestamp: string;
}

interface MLModel {
  weights: number[];
  bias: number;
  accuracy: number;
}

/**
 * Simple Linear Regression Model for Price Prediction
 */
class PricePredictionModel {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.01;
  private iterations: number = 100;

  /**
   * Train the model with historical data
   */
  train(data: PriceHistory[]): void {
    const n = data.length;
    if (n < 2) return;

    // Extract features (day of week, month, etc.)
    const X: number[][] = data.map((d, i) => [
      i, // time index
      new Date(d.date).getDay(), // day of week
      new Date(d.date).getMonth(), // month
    ]);

    const y: number[] = data.map((d) => d.price);

    // Initialize weights
    this.weights = [0, 0, 0];
    this.bias = 0;

    // Gradient descent
    for (let iter = 0; iter < this.iterations; iter++) {
      let totalError = 0;

      for (let i = 0; i < n; i++) {
        // Prediction
        let prediction = this.bias;
        for (let j = 0; j < this.weights.length; j++) {
          prediction += this.weights[j] * X[i][j];
        }

        // Error
        const error = y[i] - prediction;
        totalError += error * error;

        // Update weights
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] += this.learningRate * error * X[i][j];
        }

        // Update bias
        this.bias += this.learningRate * error;
      }
    }
  }

  /**
   * Predict future price
   */
  predict(features: number[]): number {
    let prediction = this.bias;
    for (let i = 0; i < this.weights.length; i++) {
      prediction += this.weights[i] * features[i];
    }
    return Math.max(0, prediction); // Ensure non-negative price
  }

  /**
   * Calculate model accuracy
   */
  getAccuracy(testData: PriceHistory[]): number {
    const predictions = testData.map((d, i) => {
      const features = [
        i,
        new Date(d.date).getDay(),
        new Date(d.date).getMonth(),
      ];
      return this.predict(features);
    });

    const actual = testData.map((d) => d.price);
    const errors = predictions.map((p, i) => Math.abs(p - actual[i]));
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const accuracy = Math.max(0, 100 - meanError);

    return accuracy;
  }
}

/**
 * Smart Alerts Manager
 */
export class SmartAlertsManager {
  private models: Map<string, PricePredictionModel> = new Map();
  private priceHistory: Map<string, PriceHistory[]> = new Map();

  /**
   * Initialize with historical data
   */
  initializeWithHistory(history: PriceHistory[]): void {
    // Group by country
    const grouped: Map<string, PriceHistory[]> = new Map();

    history.forEach((item) => {
      if (!grouped.has(item.country)) {
        grouped.set(item.country, []);
      }
      grouped.get(item.country)!.push(item);
    });

    // Train models for each country
    grouped.forEach((data, country) => {
      const model = new PricePredictionModel();
      model.train(data);
      this.models.set(country, model);
      this.priceHistory.set(country, data);
    });
  }

  /**
   * Generate smart alert for a country
   */
  generateAlert(
    country: string,
    currentPrice: number
  ): PriceAlert | null {
    const model = this.models.get(country);
    if (!model) return null;

    // Get historical data
    const history = this.priceHistory.get(country) || [];
    if (history.length === 0) return null;

    // Predict next price
    const features = [
      history.length,
      new Date().getDay(),
      new Date().getMonth(),
    ];
    const predictedPrice = model.predict(features);
    const confidence = model.getAccuracy(history);

    // Calculate trend
    const lastPrice = history[history.length - 1].price;
    const priceDiff = predictedPrice - currentPrice;
    const percentChange = (priceDiff / currentPrice) * 100;

    let trend: "up" | "down" | "stable" = "stable";
    if (percentChange > 2) trend = "up";
    else if (percentChange < -2) trend = "down";

    // Generate recommendation
    let recommendation = "";
    if (trend === "up" && confidence > 70) {
      recommendation = "أسعار متوقع أن ترتفع - يُنصح بالشراء الآن";
    } else if (trend === "down" && confidence > 70) {
      recommendation = "أسعار متوقع أن تنخفض - يُنصح بالانتظار";
    } else {
      recommendation = "أسعار مستقرة - يمكن الشراء في أي وقت";
    }

    return {
      id: `alert_${country}_${Date.now()}`,
      country: country,
      currentPrice: currentPrice,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round(confidence),
      trend: trend,
      recommendation: recommendation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate alerts for multiple countries
   */
  generateBatchAlerts(
    countries: string[],
    prices: Map<string, number>
  ): PriceAlert[] {
    const alerts: PriceAlert[] = [];

    countries.forEach((country) => {
      const price = prices.get(country);
      if (price) {
        const alert = this.generateAlert(country, price);
        if (alert) alerts.push(alert);
      }
    });

    return alerts;
  }

  /**
   * Detect anomalies in price data
   */
  detectAnomalies(country: string, threshold: number = 2): PriceHistory[] {
    const history = this.priceHistory.get(country) || [];
    if (history.length < 3) return [];

    const prices = history.map((h) => h.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
      prices.length;
    const stdDev = Math.sqrt(variance);

    return history.filter((h) => Math.abs(h.price - mean) > threshold * stdDev);
  }

  /**
   * Get price trend for a country
   */
  getTrend(country: string): {
    trend: "up" | "down" | "stable";
    changePercent: number;
  } | null {
    const history = this.priceHistory.get(country) || [];
    if (history.length < 2) return null;

    const firstPrice = history[0].price;
    const lastPrice = history[history.length - 1].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    let trend: "up" | "down" | "stable" = "stable";
    if (changePercent > 2) trend = "up";
    else if (changePercent < -2) trend = "down";

    return { trend, changePercent: Math.round(changePercent * 100) / 100 };
  }
}

/**
 * Mock historical data for demonstration
 */
export const mockPriceHistory: PriceHistory[] = [
  { date: "2026-01-01", price: 45.0, country: "SA" },
  { date: "2026-01-08", price: 46.2, country: "SA" },
  { date: "2026-01-15", price: 44.8, country: "SA" },
  { date: "2026-01-22", price: 47.5, country: "SA" },
  { date: "2026-01-29", price: 48.2, country: "SA" },
  { date: "2026-02-05", price: 49.1, country: "SA" },

  { date: "2026-01-01", price: 52.0, country: "AE" },
  { date: "2026-01-08", price: 51.5, country: "AE" },
  { date: "2026-01-15", price: 50.8, country: "AE" },
  { date: "2026-01-22", price: 51.2, country: "AE" },
  { date: "2026-01-29", price: 50.5, country: "AE" },
  { date: "2026-02-05", price: 49.8, country: "AE" },

  { date: "2026-01-01", price: 38.5, country: "KW" },
  { date: "2026-01-08", price: 39.2, country: "KW" },
  { date: "2026-01-15", price: 40.1, country: "KW" },
  { date: "2026-01-22", price: 39.8, country: "KW" },
  { date: "2026-01-29", price: 41.5, country: "KW" },
  { date: "2026-02-05", price: 42.3, country: "KW" },
];

/**
 * Initialize and export the smart alerts manager
 */
export const smartAlertsManager = new SmartAlertsManager();
smartAlertsManager.initializeWithHistory(mockPriceHistory);
