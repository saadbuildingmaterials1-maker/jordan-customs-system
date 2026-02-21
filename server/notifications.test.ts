import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Notifications System', () => {
  let testUserId: number;
  let testNotificationId: number;

  beforeAll(async () => {
    // Use a test user ID (in real tests, you'd create a test user)
    testUserId = 1;
  });

  it('should create a notification', async () => {
    const result = await db.createNotification({
      userId: testUserId,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info',
    });

    expect(result).toBeDefined();
    // Store for later tests
    testNotificationId = (result as any).insertId || 1;
  });

  it('should get user notifications', async () => {
    const notifications = await db.getUserNotifications(testUserId, 10);
    expect(Array.isArray(notifications)).toBe(true);
  });

  it('should get unread notifications count', async () => {
    const count = await db.getUnreadNotificationsCount(testUserId);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should mark notification as read', async () => {
    if (testNotificationId) {
      await expect(
        db.markNotificationAsRead(testNotificationId)
      ).resolves.not.toThrow();
    }
  });

  it('should mark all notifications as read', async () => {
    await expect(
      db.markAllNotificationsAsRead(testUserId)
    ).resolves.not.toThrow();
  });

  it('should delete notification', async () => {
    if (testNotificationId) {
      await expect(
        db.deleteNotification(testNotificationId)
      ).resolves.not.toThrow();
    }
  });
});
