import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(), // username without @litium.space
  email: varchar("email", { length: 255 }).unique().notNull(), // full email with @litium.space
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan", { length: 50 }).default("basic").notNull(), // basic, pro, enterprise
  role: varchar("role", { length: 20 }).default("user").notNull(), // user, admin, support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table for security tracking
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  deviceInfo: varchar("device_info"),
  location: varchar("location"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  browser: varchar("browser"),
  country: varchar("country"),
  city: varchar("city"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email messages table
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toEmail: varchar("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email recipients table (for inbox management)
export const emailRecipients = pgTable("email_recipients", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull().references(() => emails.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  isRead: boolean("is_read").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mail server settings table
export const mailServerSettings = pgTable("mail_server_settings", {
  id: serial("id").primaryKey(),
  smtpHost: varchar("smtp_host", { length: 255 }).notNull(),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpSecure: boolean("smtp_secure").default(true),
  smtpUser: varchar("smtp_user", { length: 255 }).notNull(),
  smtpPassword: varchar("smtp_password", { length: 255 }).notNull(),
  imapHost: varchar("imap_host", { length: 255 }).notNull(),
  imapPort: integer("imap_port").notNull().default(993),
  imapSecure: boolean("imap_secure").default(true),
  domain: varchar("domain", { length: 255 }).notNull().default("litium.space"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentEmails: many(emails),
  receivedEmails: many(emailRecipients),
  sessions: many(userSessions),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  sender: one(users, {
    fields: [emails.fromUserId],
    references: [users.id],
  }),
  recipients: many(emailRecipients),
}));

export const emailRecipientsRelations = relations(emailRecipients, ({ one }) => ({
  email: one(emails, {
    fields: [emailRecipients.emailId],
    references: [emails.id],
  }),
  user: one(users, {
    fields: [emailRecipients.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertEmailSchema = createInsertSchema(emails).pick({
  toEmail: true,
  subject: true,
  body: true,
});

export const insertEmailRecipientSchema = createInsertSchema(emailRecipients).pick({
  emailId: true,
  userId: true,
});

// Auth schemas
export const registerSchema = z.object({
  username: z.string()
    .min(3, "Имя пользователя должно содержать минимум 3 символа")
    .max(20, "Имя пользователя должно быть не длиннее 20 символов")
    .regex(/^[a-zA-Z0-9]+$/, "Только английские буквы и цифры"),
  email: z.string()
    .email("Введите корректный email")
    .refine((email) => {
      const allowedDomains = ['gmail.com', 'mail.ru', 'icloud.com', 'vk.com', 'yandex.ru', 'outlook.com'];
      const domain = email.split('@')[1];
      return allowedDomains.includes(domain);
    }, "Разрешены только email от провайдеров: Gmail, Mail.ru, iCloud, VK, Yandex, Outlook"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  firstName: z.string().min(1, "Введите имя").max(100),
  lastName: z.string().min(1, "Введите фамилию").max(100),
  plan: z.enum(["basic", "pro", "enterprise"]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type EmailWithSender = Email & { sender: User };
export type EmailWithDetails = Email & { sender: User; isRead: boolean };
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type MailServerSettings = typeof mailServerSettings.$inferSelect;
export type InsertMailServerSettings = typeof mailServerSettings.$inferInsert;
