import {
  users,
  emails,
  emailRecipients,
  userSessions,
  mailServerSettings,
  type User,
  type InsertUser,
  type InsertEmail,
  type Email,
  type EmailWithSender,
  type EmailWithDetails,
  type EmailRecipient,
  type UserSession,
  type InsertUserSession,
  type RegisterData,
  type LoginData,
  type MailServerSettings,
  type InsertMailServerSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: RegisterData): Promise<User>;
  validateUser(username: string, password: string): Promise<User | undefined>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  
  // Email operations
  sendEmail(fromUserId: string, email: InsertEmail): Promise<Email>;
  getInboxEmails(userId: string): Promise<EmailWithDetails[]>;
  getSentEmails(userId: string): Promise<EmailWithSender[]>;
  getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined>;
  markEmailAsRead(emailId: number, userId: string): Promise<void>;
  deleteEmail(emailId: number, userId: string): Promise<void>;
  searchEmails(userId: string, query: string): Promise<EmailWithDetails[]>;
  
  // Session operations
  createSession(sessionData: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deactivateSession(sessionId: string): Promise<void>;
  deactivateAllUserSessions(userId: string): Promise<void>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUser(userId: string, userData: Partial<User>): Promise<User>;
  getUsersCount(): Promise<number>;
  getEmailsCount(): Promise<number>;
  getRecentUsersCount(): Promise<number>;
  getRecentEmailsCount(): Promise<number>;
  
  // Mail server settings
  getMailServerSettings(): Promise<MailServerSettings | undefined>;
  updateMailServerSettings(settings: InsertMailServerSettings): Promise<MailServerSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: RegisterData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.username, // Используем username как id
        username: userData.username,
        email: userData.email,
        password: userData.password, // В реальном приложении пароль должен быть захеширован
        firstName: userData.firstName,
        lastName: userData.lastName,
        plan: userData.plan,
        isActive: true,
      })
      .returning();

    // Отправляем приветственное письмо через собственный SMTP сервер
    try {
      const { mailServer } = await import('./mailServer');
      const welcomeSubject = "Добро пожаловать в LITIUM.SPACE!";
      const welcomeBody = `
Добро пожаловать в LITIUM.SPACE, ${userData.firstName}!

Ваш аккаунт успешно создан:
• Email адрес: ${userData.username}@litium.space
• Имя: ${userData.firstName} ${userData.lastName}

LITIUM.SPACE - это независимый почтовый сервис с собственным SMTP сервером.
Теперь вы можете отправлять и получать письма с вашего нового адреса.

Возможности вашего аккаунта:
✓ Неограниченная отправка писем
✓ Защищенная связь через собственный сервер
✓ Полная независимость от внешних провайдеров
✓ Интеграция с популярными почтовыми клиентами

Настройки для почтовых клиентов:
SMTP сервер: ${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost'}
Порт: 2525
Шифрование: TLS
Имя пользователя: ${userData.username}@litium.space

Спасибо за выбор LITIUM.SPACE!

--
Команда LITIUM.SPACE
support@litium.space
      `;

      await mailServer.sendEmail(
        "support@litium.space",
        userData.email,
        welcomeSubject,
        welcomeBody
      );
      
      console.log(`Welcome email sent to: ${userData.email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Не прерываем регистрацию из-за ошибки отправки письма
    }

    return user;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)));
    return user;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: newPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Email operations
  async sendEmail(fromUserId: string, emailData: InsertEmail): Promise<Email> {
    // Создаем запись в базе данных
    const [email] = await db
      .insert(emails)
      .values({
        fromUserId: fromUserId,
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        body: emailData.body,
        sentAt: new Date(),
      })
      .returning();

    // Если письмо не для @litium.space домена, отправляем через внешний SMTP
    if (!emailData.toEmail.includes('@litium.space')) {
      try {
        await this.sendExternalEmail(fromUserId, emailData);
        console.log(`External email sent: ${fromUserId} -> ${emailData.toEmail}`);
      } catch (error) {
        console.error('Failed to send external email:', error);
      }
    }

    console.log(`Email saved: ${fromUserId} -> ${emailData.toEmail}: ${emailData.subject}`);
    return email;
  }

  private async sendExternalEmail(fromUserId: string, emailData: InsertEmail): Promise<void> {
    // Получаем настройки SMTP
    const settings = await this.getMailServerSettings();
    if (!settings || !settings.smtpHost) {
      throw new Error('SMTP settings not configured');
    }

    // Получаем данные отправителя
    const sender = await this.getUser(fromUserId);
    const fromEmail = sender?.email || 'noreply@litium.space';

    // Создаем транспорт для отправки
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransporter({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: settings.smtpUser && settings.smtpPassword ? {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      } : undefined,
    });

    // Отправляем письмо
    await transporter.sendMail({
      from: fromEmail,
      to: emailData.toEmail,
      subject: emailData.subject,
      html: emailData.body,
    });
  }

  async getInboxEmails(userId: string): Promise<EmailWithDetails[]> {
    // Получаем информацию о пользователе для определения его email адреса
    const user = await this.getUser(userId);
    if (!user) return [];

    const userEmail = `${user.username}@litium.space`;

    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        createdAt: emails.createdAt,
        updatedAt: emails.updatedAt,
        isRead: emails.isRead,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          plan: users.plan,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(eq(emails.toEmail, userEmail))
      .orderBy(desc(emails.sentAt));

    return result.map(row => ({
      ...row,
      isRead: row.isRead || false,
    }));
  }

  async getSentEmails(userId: string): Promise<EmailWithSender[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(eq(emails.fromUserId, userId))
      .orderBy(desc(emails.sentAt));

    return result;
  }

  async getEmailById(emailId: number, userId: string): Promise<EmailWithSender | undefined> {
    const [result] = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .where(
        and(
          eq(emails.id, emailId),
          or(
            eq(emails.fromUserId, userId),
            eq(emailRecipients.userId, userId)
          )
        )
      )
      .leftJoin(emailRecipients, eq(emails.id, emailRecipients.emailId));

    return result;
  }

  async markEmailAsRead(emailId: number, userId: string): Promise<void> {
    await db
      .update(emailRecipients)
      .set({ isRead: true })
      .where(
        and(
          eq(emailRecipients.emailId, emailId),
          eq(emailRecipients.userId, userId)
        )
      );
  }

  async deleteEmail(emailId: number, userId: string): Promise<void> {
    // Удаляем запись получателя
    await db
      .delete(emailRecipients)
      .where(
        and(
          eq(emailRecipients.emailId, emailId),
          eq(emailRecipients.userId, userId)
        )
      );
  }

  async searchEmails(userId: string, query: string): Promise<EmailWithDetails[]> {
    const result = await db
      .select({
        id: emails.id,
        fromUserId: emails.fromUserId,
        toEmail: emails.toEmail,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          plan: users.plan,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        isRead: emailRecipients.isRead,
      })
      .from(emails)
      .innerJoin(users, eq(emails.fromUserId, users.id))
      .innerJoin(emailRecipients, eq(emails.id, emailRecipients.emailId))
      .where(
        and(
          eq(emailRecipients.userId, userId),
          or(
            like(emails.subject, `%${query}%`),
            like(emails.body, `%${query}%`)
          )
        )
      )
      .orderBy(desc(emails.sentAt));

    return result.map(row => ({
      ...row,
      isRead: row.isRead || false,
    }));
  }

  // Session operations
  async createSession(sessionData: InsertUserSession): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)))
      .orderBy(desc(userSessions.lastActivity));
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      plan: users.plan,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }

  async getEmailsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(emails);
    return result[0].count;
  }

  async getRecentUsersCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);
    return result[0].count;
  }

  async getRecentEmailsCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(sql`${emails.createdAt} >= ${thirtyDaysAgo}`);
    return result[0].count;
  }

  // Mail server settings methods
  async getMailServerSettings(): Promise<MailServerSettings | undefined> {
    const [settings] = await db.select().from(mailServerSettings).where(eq(mailServerSettings.isActive, true));
    return settings;
  }

  async updateMailServerSettings(settingsData: InsertMailServerSettings): Promise<MailServerSettings> {
    // Деактивируем все существующие настройки
    await db
      .update(mailServerSettings)
      .set({ isActive: false, updatedAt: new Date() });

    // Создаем новые активные настройки
    const [settings] = await db
      .insert(mailServerSettings)
      .values({
        ...settingsData,
        isActive: true,
        updatedAt: new Date(),
      })
      .returning();
    
    return settings;
  }
}

export const storage = new DatabaseStorage();