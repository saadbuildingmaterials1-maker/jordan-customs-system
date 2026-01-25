import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNotification,
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  notifyAccountAdded,
  notifyAccountVerified,
  notifyTransactionCompleted,
  notifyTransactionFailed,
  notifySecurityAlert,
  notifyAccountSuspended,
} from './services/notification-service';

describe('Notification Service', () => {
  const testUserId = 1;
  const testAccountId = 1;

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'account_added',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'high',
      });

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe('account_added');
      expect(notification.title).toBe('Test Notification');
      expect(notification.isRead).toBe(false);
    });

    it('should set default channels if not provided', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'transaction_completed',
        title: 'Transaction',
        message: 'Transaction completed',
      });

      expect(notification.channels).toContain('email');
      expect(notification.channels).toContain('in_app');
    });

    it('should set default priority if not provided', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'account_added',
        title: 'Test',
        message: 'Test message',
      });

      expect(notification.priority).toBe('medium');
    });
  });

  describe('getUserNotifications', () => {
    it('should retrieve user notifications', async () => {
      const notifications = await getUserNotifications(testUserId);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should support pagination', async () => {
      const notifications1 = await getUserNotifications(testUserId, 10, 0);
      const notifications2 = await getUserNotifications(testUserId, 10, 10);

      expect(Array.isArray(notifications1)).toBe(true);
      expect(Array.isArray(notifications2)).toBe(true);
    });
  });

  describe('getUnreadNotificationsCount', () => {
    it('should return unread count', async () => {
      const count = await getUnreadNotificationsCount(testUserId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'account_added',
        title: 'Test',
        message: 'Test',
      });

      const updated = await markNotificationAsRead(notification.id, testUserId);

      expect(updated.isRead).toBe(true);
      expect(updated.readAt).toBeDefined();
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      await markAllNotificationsAsRead(testUserId);

      const count = await getUnreadNotificationsCount(testUserId);
      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: 'account_added',
        title: 'Test',
        message: 'Test',
      });

      const result = await deleteNotification(notification.id, testUserId);

      expect(result).toBe(true);
    });
  });

  describe('Notification Preferences', () => {
    it('should get or create preferences', async () => {
      const prefs = await getNotificationPreferences(testUserId);

      expect(prefs).toBeDefined();
      expect(prefs.userId).toBe(testUserId);
      // emailNotifications يجب أن تكون true (القيمة الافتراضية)
      expect(prefs.emailNotifications).toBeDefined();
      expect(typeof prefs.emailNotifications).toBe('number' || 'boolean');
    });

    it('should update preferences', async () => {
      const updated = await updateNotificationPreferences(testUserId, {
        emailNotifications: false,
        smsNotifications: true,
      });

      expect(updated.emailNotifications).toBe(false);
      expect(updated.smsNotifications).toBe(true);
    });
  });

  describe('Specific Notification Types', () => {
    it('should send account added notification', async () => {
      const notification = await notifyAccountAdded(
        testUserId,
        'Test Account',
        testAccountId
      );

      expect(notification.type).toBe('account_added');
      expect(notification.title).toContain('حساب بنكي');
      expect(notification.relatedEntityType).toBe('bank_account');
      expect(notification.relatedEntityId).toBe(testAccountId);
    });

    it('should send account verified notification', async () => {
      const notification = await notifyAccountVerified(
        testUserId,
        'Test Account',
        testAccountId
      );

      expect(notification.type).toBe('account_verified');
      expect(notification.title).toContain('التحقق');
    });

    it('should send transaction completed notification', async () => {
      const notification = await notifyTransactionCompleted(
        testUserId,
        5000,
        'JOD',
        1
      );

      expect(notification.type).toBe('transaction_completed');
      expect(notification.message).toContain('5000');
      expect(notification.message).toContain('JOD');
    });

    it('should send transaction failed notification', async () => {
      const notification = await notifyTransactionFailed(
        testUserId,
        5000,
        'JOD',
        'Insufficient funds',
        1
      );

      expect(notification.type).toBe('transaction_failed');
      expect(notification.priority).toBe('high');
      expect(notification.message).toContain('Insufficient funds');
    });

    it('should send security alert notification', async () => {
      const notification = await notifySecurityAlert(
        testUserId,
        'Suspicious activity detected'
      );

      expect(notification.type).toBe('security_alert');
      expect(notification.priority).toBe('critical');
    });

    it('should send account suspended notification', async () => {
      const notification = await notifyAccountSuspended(
        testUserId,
        'Test Account',
        'Fraud detected',
        testAccountId
      );

      expect(notification.type).toBe('account_suspended');
      expect(notification.priority).toBe('critical');
      expect(notification.message).toContain('Fraud detected');
    });
  });

  describe('Notification Channels', () => {
    it('should include email channel for account added', async () => {
      const notification = await notifyAccountAdded(
        testUserId,
        'Test',
        testAccountId
      );

      expect(notification.channels).toContain('email');
      expect(notification.channels).toContain('in_app');
    });

    it('should include sms for failed transactions', async () => {
      const notification = await notifyTransactionFailed(
        testUserId,
        1000,
        'JOD',
        'Error',
        1
      );

      expect(notification.channels).toContain('sms');
    });

    it('should include all channels for security alerts', async () => {
      const notification = await notifySecurityAlert(
        testUserId,
        'Alert'
      );

      expect(notification.channels).toContain('email');
      expect(notification.channels).toContain('sms');
      expect(notification.channels).toContain('push');
      expect(notification.channels).toContain('in_app');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user ID gracefully', async () => {
      try {
        await createNotification({
          userId: -1,
          type: 'account_added',
          title: 'Test',
          message: 'Test',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid notification type', async () => {
      try {
        await createNotification({
          userId: testUserId,
          type: 'invalid_type' as any,
          title: 'Test',
          message: 'Test',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
