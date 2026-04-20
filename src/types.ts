export type Category = 'Personal' | 'Work' | 'Important' | 'Social' | 'Other';

export interface Notification {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  category: Category;
  app: string;
  isEncrypted: boolean;
  summary?: string;
}

export interface AISummary {
  totalNotifications: number;
  urgentCount: number;
  summaryText: string;
  breakdown: Record<Category, number>;
}

export interface Reminder {
  id: string;
  notificationId: string;
  reminderTime: string;
  createdAt: string;
  isCompleted: boolean;
}
