/**
 * خدمة الدعم الفني المتقدمة
 * Advanced Support Service - Tickets, Live Chat, Attachments
 */

export interface SupportTicket {
  id: string;
  userId: number;
  title: string;
  description: string;
  category: "billing" | "technical" | "account" | "general" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  rating?: number;
  feedback?: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  sender: "customer" | "support";
  senderId: number | string;
  message: string;
  attachments?: string[];
  createdAt: Date;
  isRead: boolean;
}

export interface SupportAttachment {
  id: string;
  ticketId: string;
  messageId?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number | string;
  uploadedAt: Date;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "online" | "offline" | "busy" | "away";
  activeTickets: number;
  totalTicketsResolved: number;
  averageResolutionTime: number;
  rating: number;
}

class AdvancedSupportService {
  private tickets: Map<string, SupportTicket> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private attachments: Map<string, SupportAttachment[]> = new Map();
  private agents: Map<string, SupportAgent> = new Map();

  /**
   * إنشاء تذكرة دعم جديدة
   * Create new support ticket
   */
  async createTicket(
    userId: number,
    data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      ...data,
      id: `ticket-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, ticket);
    this.messages.set(ticket.id, []);
    this.attachments.set(ticket.id, []);

    console.log(`Support ticket created: ${ticket.id}`);
    return ticket;
  }

  /**
   * الحصول على التذكرة حسب المعرف
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<SupportTicket | undefined> {
    return this.tickets.get(ticketId);
  }

  /**
   * الحصول على تذاكر المستخدم
   * Get user's tickets
   */
  async getUserTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values()).filter(
      (t) => t.userId === userId
    );
  }

  /**
   * تحديث حالة التذكرة
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"]
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
      if (status === "resolved") {
        ticket.resolvedAt = new Date();
      }
      console.log(`Ticket ${ticketId} status updated to ${status}`);
    }
  }

  /**
   * إضافة رسالة إلى الدردشة
   * Add message to chat
   */
  async addMessage(
    ticketId: string,
    message: Omit<ChatMessage, "id" | "createdAt">
  ): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date(),
    };

    const messages = this.messages.get(ticketId) || [];
    messages.push(chatMessage);
    this.messages.set(ticketId, messages);

    // تحديث وقت آخر تحديث للتذكرة
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.updatedAt = new Date();
    }

    console.log(`Message added to ticket ${ticketId}`);
    return chatMessage;
  }

  /**
   * الحصول على رسائل التذكرة
   * Get ticket messages
   */
  async getTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    return this.messages.get(ticketId) || [];
  }

  /**
   * إضافة مرفق إلى التذكرة
   * Add attachment to ticket
   */
  async addAttachment(
    ticketId: string,
    attachment: Omit<SupportAttachment, "id" | "uploadedAt">
  ): Promise<SupportAttachment> {
    const newAttachment: SupportAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
      uploadedAt: new Date(),
    };

    const attachments = this.attachments.get(ticketId) || [];
    attachments.push(newAttachment);
    this.attachments.set(ticketId, attachments);

    console.log(`Attachment added to ticket ${ticketId}`);
    return newAttachment;
  }

  /**
   * الحصول على مرفقات التذكرة
   * Get ticket attachments
   */
  async getTicketAttachments(ticketId: string): Promise<SupportAttachment[]> {
    return this.attachments.get(ticketId) || [];
  }

  /**
   * تقييم التذكرة
   * Rate ticket resolution
   */
  async rateTicket(
    ticketId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.rating = Math.max(1, Math.min(5, rating));
      ticket.feedback = feedback;
      ticket.status = "closed";
      ticket.updatedAt = new Date();
      console.log(`Ticket ${ticketId} rated: ${rating}/5`);
    }
  }

  /**
   * تعيين وكيل للتذكرة
   * Assign agent to ticket
   */
  async assignAgent(ticketId: string, agentId: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.assignedTo = agentId;
      ticket.status = "in_progress";
      ticket.updatedAt = new Date();

      const agent = this.agents.get(agentId);
      if (agent) {
        agent.activeTickets += 1;
      }

      console.log(`Agent ${agentId} assigned to ticket ${ticketId}`);
    }
  }

  /**
   * الحصول على الوكلاء المتاحين
   * Get available agents
   */
  async getAvailableAgents(): Promise<SupportAgent[]> {
    return Array.from(this.agents.values()).filter(
      (a) => a.status === "online" && a.activeTickets < 5
    );
  }

  /**
   * إنشاء وكيل دعم جديد
   * Create new support agent
   */
  async createAgent(
    data: Omit<SupportAgent, "id" | "activeTickets" | "totalTicketsResolved">
  ): Promise<SupportAgent> {
    const agent: SupportAgent = {
      ...data,
      id: `agent-${Date.now()}`,
      activeTickets: 0,
      totalTicketsResolved: 0,
    };

    this.agents.set(agent.id, agent);
    console.log(`Support agent created: ${agent.id}`);
    return agent;
  }

  /**
   * الحصول على إحصائيات الدعم
   * Get support statistics
   */
  async getSupportStats() {
    const allTickets = Array.from(this.tickets.values());
    const openTickets = allTickets.filter((t) => t.status === "open").length;
    const inProgressTickets = allTickets.filter(
      (t) => t.status === "in_progress"
    ).length;
    const resolvedTickets = allTickets.filter(
      (t) => t.status === "resolved"
    ).length;
    const closedTickets = allTickets.filter((t) => t.status === "closed").length;

    const avgResolutionTime =
      resolvedTickets > 0
        ? allTickets
            .filter((t) => t.resolvedAt)
            .reduce((sum, t) => {
              if (t.resolvedAt) {
                return (
                  sum +
                  (t.resolvedAt.getTime() - t.createdAt.getTime()) /
                    (1000 * 60 * 60)
                );
              }
              return sum;
            }, 0) / resolvedTickets
        : 0;

    const avgRating =
      allTickets.filter((t) => t.rating).length > 0
        ? allTickets.reduce((sum, t) => sum + (t.rating || 0), 0) /
          allTickets.filter((t) => t.rating).length
        : 0;

    return {
      totalTickets: allTickets.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime: avgResolutionTime.toFixed(2),
      averageRating: avgRating.toFixed(2),
      totalAgents: this.agents.size,
      onlineAgents: Array.from(this.agents.values()).filter(
        (a) => a.status === "online"
      ).length,
    };
  }

  /**
   * البحث عن التذاكر
   * Search tickets
   */
  async searchTickets(
    query: string,
    filters?: {
      status?: SupportTicket["status"];
      category?: SupportTicket["category"];
      priority?: SupportTicket["priority"];
    }
  ): Promise<SupportTicket[]> {
    let results = Array.from(this.tickets.values());

    if (query) {
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.status) {
      results = results.filter((t) => t.status === filters.status);
    }

    if (filters?.category) {
      results = results.filter((t) => t.category === filters.category);
    }

    if (filters?.priority) {
      results = results.filter((t) => t.priority === filters.priority);
    }

    return results;
  }

  /**
   * إغلاق التذكرة
   * Close ticket
   */
  async closeTicket(ticketId: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.status = "closed";
      ticket.updatedAt = new Date();

      if (ticket.assignedTo) {
        const agent = this.agents.get(ticket.assignedTo);
        if (agent && agent.activeTickets > 0) {
          agent.activeTickets -= 1;
          agent.totalTicketsResolved += 1;
        }
      }

      console.log(`Ticket ${ticketId} closed`);
    }
  }
}

export const advancedSupportService = new AdvancedSupportService();
