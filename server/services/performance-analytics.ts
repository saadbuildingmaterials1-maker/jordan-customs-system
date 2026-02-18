/**
 * خدمة تحليل الأداء (Performance Analytics Service)
 * 
 * @module ./server/services/performance-analytics
 * @description تحليل أداء الموظفين والفريق مع رسوم بيانية متقدمة
 */

import { getDb } from "../db";
import { liveChatConversations, liveChatMessages } from "../../drizzle/live-chat-schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface AgentPerformanceMetrics {
  agentId: number;
  agentName: string;
  totalConversations: number;
  activeConversations: number;
  closedConversations: number;
  averageResponseTime: number; // بالثواني
  averageResolutionTime: number; // بالدقائق
  customerSatisfaction: number; // من 5
  messageCount: number;
  firstResponseRate: number; // النسبة المئوية
  resolutionRate: number; // النسبة المئوية
  escalationCount: number;
  escalationRate: number; // النسبة المئوية
}

export interface TeamPerformanceMetrics {
  totalAgents: number;
  totalConversations: number;
  activeConversations: number;
  closedConversations: number;
  averageTeamResponseTime: number;
  averageTeamResolutionTime: number;
  teamSatisfaction: number;
  topPerformers: AgentPerformanceMetrics[];
  bottomPerformers: AgentPerformanceMetrics[];
  trends: {
    date: string;
    conversations: number;
    satisfaction: number;
    responseTime: number;
  }[];
}

export interface PerformanceReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  agents: AgentPerformanceMetrics[];
  team: TeamPerformanceMetrics;
  insights: string[];
  recommendations: string[];
}

/**
 * فئة تحليل الأداء
 */
class PerformanceAnalytics {
  /**
   * حساب مقاييس أداء الموظف
   */
  async calculateAgentMetrics(
    agentId: number,
    agentName: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AgentPerformanceMetrics> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // آخر 30 يوم
    const end = endDate || new Date();

    // الحصول على المحادثات
    let query = db
      .select()
      .from(liveChatConversations)
      .where(eq(liveChatConversations.supportAgentId, agentId));

    const conversations = await query;

    // حساب المقاييس
    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(
      (c) => c.status === "in_progress" || c.status === "open"
    ).length;
    const closedConversations = conversations.filter(
      (c) => c.status === "resolved"
    ).length;

    // حساب متوسط وقت الاستجابة
    const responseTimes = conversations
      .filter((c) => c.firstResponseTime && c.createdAt)
      .map((c) => (c.firstResponseTime!.getTime() - c.createdAt.getTime()) / 1000);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // حساب متوسط وقت الحل
    const resolutionTimes = conversations
      .filter((c) => c.resolvedTime && c.createdAt)
      .map((c) => (c.resolvedTime!.getTime() - c.createdAt.getTime()) / 1000 / 60);

    const averageResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

    // حساب رضا العملاء
    const ratedConversations = conversations.filter((c) => c.rating);
    const customerSatisfaction =
      ratedConversations.length > 0
        ? ratedConversations.reduce((sum, c) => sum + (c.rating || 0), 0) /
          ratedConversations.length
        : 0;

    // حساب عدد الرسائل
    const messages = await db
      .select()
      .from(liveChatMessages)
      .where(eq(liveChatMessages.senderId, agentId));

    const messageCount = messages.length;

    // حساب النسب المئوية
    const firstResponseRate =
      totalConversations > 0
        ? (responseTimes.length / totalConversations) * 100
        : 0;

    const resolutionRate =
      totalConversations > 0 ? (closedConversations / totalConversations) * 100 : 0;

    const escalationCount = conversations.filter(
      (c) => c.priority === "urgent"
    ).length;

    const escalationRate =
      totalConversations > 0 ? (escalationCount / totalConversations) * 100 : 0;

    return {
      agentId,
      agentName,
      totalConversations,
      activeConversations,
      closedConversations,
      averageResponseTime: Math.round(averageResponseTime),
      averageResolutionTime: Math.round(averageResolutionTime),
      customerSatisfaction: Math.round(customerSatisfaction * 100) / 100,
      messageCount,
      firstResponseRate: Math.round(firstResponseRate),
      resolutionRate: Math.round(resolutionRate),
      escalationCount,
      escalationRate: Math.round(escalationRate),
    };
  }

  /**
   * حساب مقاييس أداء الفريق
   */
  async calculateTeamMetrics(
    agentIds: number[],
    startDate?: Date,
    endDate?: Date
  ): Promise<TeamPerformanceMetrics> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // حساب مقاييس كل موظف
    const agentMetrics: AgentPerformanceMetrics[] = [];

    for (const agentId of agentIds) {
      const metrics = await this.calculateAgentMetrics(
        agentId,
        `Agent ${agentId}`,
        startDate,
        endDate
      );
      agentMetrics.push(metrics);
    }

    // حساب مقاييس الفريق
    const totalAgents = agentIds.length;
    const totalConversations = agentMetrics.reduce(
      (sum, m) => sum + m.totalConversations,
      0
    );
    const activeConversations = agentMetrics.reduce(
      (sum, m) => sum + m.activeConversations,
      0
    );
    const closedConversations = agentMetrics.reduce(
      (sum, m) => sum + m.closedConversations,
      0
    );

    const averageTeamResponseTime =
      agentMetrics.length > 0
        ? agentMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) /
          agentMetrics.length
        : 0;

    const averageTeamResolutionTime =
      agentMetrics.length > 0
        ? agentMetrics.reduce((sum, m) => sum + m.averageResolutionTime, 0) /
          agentMetrics.length
        : 0;

    const teamSatisfaction =
      agentMetrics.length > 0
        ? agentMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) /
          agentMetrics.length
        : 0;

    // الحصول على أفضل وأسوأ الأداء
    const sortedByPerformance = [...agentMetrics].sort(
      (a, b) => b.customerSatisfaction - a.customerSatisfaction
    );

    const topPerformers = sortedByPerformance.slice(0, 3);
    const bottomPerformers = sortedByPerformance.slice(-3).reverse();

    // حساب الاتجاهات
    const trends = this.generateTrends(agentMetrics);

    return {
      totalAgents,
      totalConversations,
      activeConversations,
      closedConversations,
      averageTeamResponseTime: Math.round(averageTeamResponseTime),
      averageTeamResolutionTime: Math.round(averageTeamResolutionTime),
      teamSatisfaction: Math.round(teamSatisfaction * 100) / 100,
      topPerformers,
      bottomPerformers,
      trends,
    };
  }

  /**
   * توليد تقرير الأداء الشامل
   */
  async generatePerformanceReport(
    agentIds: number[],
    startDate?: Date,
    endDate?: Date
  ): Promise<PerformanceReport> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // حساب مقاييس الموظفين
    const agents: AgentPerformanceMetrics[] = [];
    for (const agentId of agentIds) {
      const metrics = await this.calculateAgentMetrics(
        agentId,
        `Agent ${agentId}`,
        start,
        end
      );
      agents.push(metrics);
    }

    // حساب مقاييس الفريق
    const team = await this.calculateTeamMetrics(agentIds, start, end);

    // توليد الرؤى والتوصيات
    const insights = this.generateInsights(agents, team);
    const recommendations = this.generateRecommendations(agents, team);

    return {
      period: { startDate: start, endDate: end },
      agents,
      team,
      insights,
      recommendations,
    };
  }

  /**
   * توليد الرؤى
   */
  private generateInsights(
    agents: AgentPerformanceMetrics[],
    team: TeamPerformanceMetrics
  ): string[] {
    const insights: string[] = [];

    // رؤى عن الأداء العام
    if (team.teamSatisfaction >= 4.5) {
      insights.push("أداء الفريق ممتازة جداً مع رضا عملاء عالي جداً");
    } else if (team.teamSatisfaction >= 4) {
      insights.push("أداء الفريق جيدة مع رضا عملاء عالي");
    } else if (team.teamSatisfaction >= 3) {
      insights.push("أداء الفريق متوسطة - هناك مجال للتحسن");
    } else {
      insights.push("أداء الفريق تحتاج إلى تحسن فوري");
    }

    // رؤى عن وقت الاستجابة
    if (team.averageTeamResponseTime < 60) {
      insights.push("وقت الاستجابة ممتاز - أقل من دقيقة");
    } else if (team.averageTeamResponseTime < 300) {
      insights.push("وقت الاستجابة جيد - حوالي 5 دقائق");
    } else {
      insights.push("وقت الاستجابة بطيء - يحتاج إلى تحسن");
    }

    // رؤى عن معدل التصعيد
    const avgEscalationRate =
      agents.reduce((sum, a) => sum + a.escalationRate, 0) / agents.length;

    if (avgEscalationRate < 5) {
      insights.push("معدل التصعيد منخفض جداً - الموظفون يتعاملون مع المشاكل بكفاءة");
    } else if (avgEscalationRate > 20) {
      insights.push("معدل التصعيد مرتفع - قد تحتاج إلى تدريب إضافي");
    }

    return insights;
  }

  /**
   * توليد التوصيات
   */
  private generateRecommendations(
    agents: AgentPerformanceMetrics[],
    team: TeamPerformanceMetrics
  ): string[] {
    const recommendations: string[] = [];

    // توصيات بناءً على الأداء
    if (team.teamSatisfaction < 4) {
      recommendations.push("تقديم تدريب إضافي للموظفين لتحسين مهارات التعامل مع العملاء");
    }

    if (team.averageTeamResponseTime > 300) {
      recommendations.push("زيادة عدد الموظفين أو تحسين توزيع المحادثات");
    }

    // توصيات للموظفين ذوي الأداء المنخفض
    const lowPerformers = agents.filter((a) => a.customerSatisfaction < 3);
    if (lowPerformers.length > 0) {
      recommendations.push(
        `تقديم دعم فردي للموظفين: ${lowPerformers.map((a) => a.agentName).join(", ")}`
      );
    }

    // توصيات للموظفين ذوي الأداء العالي
    const topPerformers = agents.filter((a) => a.customerSatisfaction >= 4.5);
    if (topPerformers.length > 0) {
      recommendations.push(
        `تكريم الموظفين ذوي الأداء العالي: ${topPerformers.map((a) => a.agentName).join(", ")}`
      );
    }

    return recommendations;
  }

  /**
   * توليد الاتجاهات
   */
  private generateTrends(
    agents: AgentPerformanceMetrics[]
  ): { date: string; conversations: number; satisfaction: number; responseTime: number }[] {
    const trends = [];

    // توليد بيانات تجريبية للاتجاهات (في الواقع ستأتي من قاعدة البيانات)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split("T")[0],
        conversations: Math.floor(Math.random() * 100 + 50),
        satisfaction: Math.random() * 2 + 3.5,
        responseTime: Math.floor(Math.random() * 200 + 100),
      });
    }

    return trends;
  }

  /**
   * الحصول على إحصائيات مقارنة
   */
  async getComparativeAnalysis(
    agentId1: number,
    agentId2: number,
    agentName1: string,
    agentName2: string
  ) {
    const metrics1 = await this.calculateAgentMetrics(agentId1, agentName1);
    const metrics2 = await this.calculateAgentMetrics(agentId2, agentName2);

    return {
      agent1: metrics1,
      agent2: metrics2,
      comparison: {
        responseTimeDifference: metrics1.averageResponseTime - metrics2.averageResponseTime,
        satisfactionDifference: metrics1.customerSatisfaction - metrics2.customerSatisfaction,
        resolutionRateDifference: metrics1.resolutionRate - metrics2.resolutionRate,
        winner: metrics1.customerSatisfaction > metrics2.customerSatisfaction ? 1 : 2,
      },
    };
  }
}

// إنشاء مثيل واحد من خدمة تحليل الأداء
export const performanceAnalytics = new PerformanceAnalytics();

/**
 * دالة مساعدة لحساب مقاييس الموظف
 */
export async function getAgentMetrics(
  agentId: number,
  agentName: string,
  startDate?: Date,
  endDate?: Date
): Promise<AgentPerformanceMetrics> {
  return performanceAnalytics.calculateAgentMetrics(agentId, agentName, startDate, endDate);
}

/**
 * دالة مساعدة لحساب مقاييس الفريق
 */
export async function getTeamMetrics(
  agentIds: number[],
  startDate?: Date,
  endDate?: Date
): Promise<TeamPerformanceMetrics> {
  return performanceAnalytics.calculateTeamMetrics(agentIds, startDate, endDate);
}

/**
 * دالة مساعدة لتوليد التقرير
 */
export async function generateReport(
  agentIds: number[],
  startDate?: Date,
  endDate?: Date
): Promise<PerformanceReport> {
  return performanceAnalytics.generatePerformanceReport(agentIds, startDate, endDate);
}
