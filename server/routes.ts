import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { storage } from "./storage";
import { registerSchema, loginSchema, insertEmailSchema } from "@shared/schema";
import { mailServer } from "./mailServer";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Настройка постоянных сессий с базой данных
const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах
const pgStore = connectPg(session);

// Настройка multer для загрузки файлов
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

// Middleware для проверки аутентификации
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = req.session.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Добавляем cookie parser
  app.use(cookieParser());
  
  // Настройка сессий с базой данных
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'litium-space-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'litium.session',
    cookie: {
      secure: false, // true для HTTPS в продакшене
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: 'lax'
    }
  }));

  // Custom Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Проверяем, что пользователь не существует
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email уже используется" });
      }

      // Создаем пользователя
      const user = await storage.createUser(userData);
      
      // Создаем сессию
      (req as any).session.user = user;
      
      res.json({ user, message: "Регистрация успешна" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(loginData.username, loginData.password);
      if (!user) {
        return res.status(401).json({ message: "Неверные данные входа" });
      }

      // Создаем сессию
      (req as any).session.user = user;

      // Создаем запись в user_sessions
      const userAgent = req.get('User-Agent') || 'Неизвестное устройство';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      
      try {
        await storage.createSession({
          id: (req as any).sessionID,
          userId: user.id,
          sessionId: (req as any).sessionID,
          deviceInfo: userAgent,
          location: 'Россия, Москва', // Упрощенно для демо
          ipAddress: ipAddress,
          isActive: true
        });
      } catch (sessionError) {
        console.error("Error creating session:", sessionError);
        // Не прерываем вход из-за ошибки сессии
      }
      
      res.json({ user, message: "Вход выполнен успешно" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Ошибка входа" });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie('litium.session');
      res.json({ message: "Выход выполнен успешно" });
    });
  });

  // API роут для загрузки аватара
  app.post("/api/users/avatar", requireAuth, upload.single('avatar'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Файл не загружен" });
      }

      const userId = req.user.id;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Обновляем profileImageUrl в базе данных
      await db
        .update(users)
        .set({ profileImageUrl: avatarUrl })
        .where(eq(users.id, userId));

      res.json({ 
        message: "Аватар успешно загружен",
        avatarUrl 
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Ошибка при загрузке аватара" });
    }
  });

  // Статические файлы для аватаров
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Email routes
  app.post('/api/emails/send', requireAuth, async (req: any, res) => {
    try {
      const { toEmail, subject, body } = req.body;
      const fromUserId = req.user.id;
      
      if (!toEmail || !subject || !body) {
        return res.status(400).json({ message: "Заполните все поля" });
      }

      console.log(`Sending email from ${fromUserId} to ${toEmail}: ${subject}`);

      // Сохраняем письмо в отправленных у отправителя
      const email = await storage.sendEmail(fromUserId, { toEmail, subject, body });
      
      // Для внутренних писем @litium.space также создаем входящее для получателя
      if (toEmail.includes('@litium.space')) {
        const recipientUsername = toEmail.split('@')[0];
        const recipient = await storage.getUserByUsername(recipientUsername);
        
        if (recipient) {
          // Создаем входящее письмо для получателя
          await storage.sendEmail(fromUserId, { 
            toEmail: toEmail, 
            subject: subject, 
            body: body 
          });
          console.log(`Internal email delivered to ${recipientUsername}`);
        } else {
          console.log(`Recipient ${recipientUsername} not found`);
        }
      } else {
        // Для внешних адресов используем SMTP сервер
        try {
          const senderUser = await storage.getUser(fromUserId);
          const fromEmail = `${senderUser?.username}@litium.space`;
          await mailServer.sendEmail(fromEmail, toEmail, subject, body);
          console.log(`External email sent via SMTP to ${toEmail}`);
        } catch (smtpError) {
          console.error("SMTP delivery error:", smtpError);
          return res.status(500).json({ message: "Ошибка отправки внешнего письма. Настройте SMTP в админ панели." });
        }
      }

      res.json({ message: "Письмо отправлено", email });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ message: "Ошибка отправки письма" });
    }
  });

  app.get('/api/emails/inbox', requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getInboxEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get inbox error:", error);
      res.status(500).json({ message: "Failed to get inbox" });
    }
  });

  app.get('/api/emails/sent', requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getSentEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get sent error:", error);
      res.status(500).json({ message: "Failed to get sent emails" });
    }
  });

  app.get('/api/emails/:id', requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const email = await storage.getEmailById(emailId, req.user.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      console.error("Get email error:", error);
      res.status(500).json({ message: "Failed to get email" });
    }
  });

  app.put("/api/emails/:id/read", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.markEmailAsRead(emailId, req.user.id);
      res.json({ message: "Email marked as read" });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.delete("/api/emails/:id", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.deleteEmail(emailId, req.user.id);
      res.json({ message: "Email deleted" });
    } catch (error) {
      console.error("Delete email error:", error);
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  app.get("/api/emails/search/:query", requireAuth, async (req: any, res) => {
    try {
      const query = req.params.query;
      const emails = await storage.searchEmails(req.user.id, query);
      res.json(emails);
    } catch (error) {
      console.error("Search emails error:", error);
      res.status(500).json({ message: "Failed to search emails" });
    }
  });

  // Sessions routes
  app.get('/api/sessions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getUserSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.delete('/api/sessions/:sessionId', requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deactivateSession(sessionId);
      res.json({ message: "Session terminated successfully" });
    } catch (error) {
      console.error("Error terminating session:", error);
      res.status(500).json({ message: "Failed to terminate session" });
    }
  });

  // Password change route
  app.post('/api/auth/change-password', requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Since we're using a custom auth system, validate current password
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidPassword = await storage.validateUser(user.username, currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password in database
      await storage.updateUserPassword(userId, newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Logout route
  app.get('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.clearCookie('litium.session');
      res.redirect('/');
    });
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const totalUsers = await storage.getUsersCount();
      const totalEmails = await storage.getEmailsCount();
      const recentUsers = await storage.getRecentUsersCount();
      const recentEmails = await storage.getRecentEmailsCount();
      
      // Calculate growth percentages
      const userGrowth = totalUsers > 0 ? Math.round((recentUsers / Math.max(totalUsers - recentUsers, 1)) * 100) : 0;
      const emailGrowth = totalEmails > 0 ? Math.round((recentEmails / Math.max(totalEmails - recentEmails, 1)) * 100) : 0;

      res.json({
        totalUsers,
        totalEmails,
        recentUsers,
        recentEmails,
        userGrowth,
        emailGrowth,
        systemUptime: 99.5,
        serversOnline: "1/1"
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId", requireAuth, async (req: any, res) => {
    try {
      console.log("PATCH request received, user:", req.user);
      const userId = req.user.id;
      if (userId !== 'support') {
        console.log("Access denied for user:", userId);
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId: targetUserId } = req.params;
      const userData = req.body;
      console.log("Updating user:", targetUserId, "with data:", userData);

      const updatedUser = await storage.updateUser(targetUserId, userData);
      console.log("User updated successfully:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Mail server settings endpoints
  app.get("/api/admin/mail-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const settings = await storage.getMailServerSettings();
      if (!settings) {
        return res.json({
          smtpHost: "",
          smtpPort: 587,
          smtpSecure: true,
          smtpUser: "",
          smtpPassword: "",
          imapHost: "",
          imapPort: 993,
          imapSecure: true,
          domain: "litium.space",
          isActive: false
        });
      }

      // Не возвращаем пароль в ответе
      const { smtpPassword, ...safeSettings } = settings;
      res.json({ ...safeSettings, smtpPassword: "••••••••" });
    } catch (error) {
      console.error("Error fetching mail settings:", error);
      res.status(500).json({ message: "Failed to fetch mail settings" });
    }
  });

  app.post("/api/admin/mail-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const {
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        imapHost,
        imapPort,
        imapSecure,
        domain
      } = req.body;

      if (!smtpHost || !smtpUser || !smtpPassword || !imapHost || !domain) {
        return res.status(400).json({ message: "Заполните все обязательные поля" });
      }

      const settings = await storage.updateMailServerSettings({
        smtpHost,
        smtpPort: Number(smtpPort) || 587,
        smtpSecure: Boolean(smtpSecure),
        smtpUser,
        smtpPassword,
        imapHost,
        imapPort: Number(imapPort) || 993,
        imapSecure: Boolean(imapSecure),
        domain,
      });

      // Не возвращаем пароль в ответе
      const { smtpPassword: _, ...safeSettings } = settings;
      res.json({ ...safeSettings, smtpPassword: "••••••••" });
    } catch (error) {
      console.error("Error updating mail settings:", error);
      res.status(500).json({ message: "Failed to update mail settings" });
    }
  });

  // Email routes
  app.post("/api/emails/send", requireAuth, async (req: any, res) => {
    try {
      console.log("Email send request:", { userId: req.user.id, body: req.body });
      const emailData = insertEmailSchema.parse(req.body);
      console.log("Parsed email data:", emailData);
      const email = await storage.sendEmail(req.user.id, emailData);
      console.log("Email saved successfully:", email);
      res.json(email);
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ message: "Ошибка отправки письма" });
    }
  });

  app.get("/api/emails/inbox", requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getInboxEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get inbox error:", error);
      res.status(500).json({ message: "Failed to get inbox" });
    }
  });

  app.get("/api/emails/sent", requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getSentEmails(req.user.id);
      res.json(emails);
    } catch (error) {
      console.error("Get sent emails error:", error);
      res.status(500).json({ message: "Failed to get sent emails" });
    }
  });

  app.get("/api/emails/:id", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const email = await storage.getEmailById(emailId, req.user.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      console.error("Get email error:", error);
      res.status(500).json({ message: "Failed to get email" });
    }
  });

  app.put("/api/emails/:id/read", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.markEmailAsRead(emailId, req.user.id);
      res.json({ message: "Email marked as read" });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.delete("/api/emails/:id", requireAuth, async (req: any, res) => {
    try {
      const emailId = parseInt(req.params.id);
      await storage.deleteEmail(emailId, req.user.id);
      res.json({ message: "Email deleted" });
    } catch (error) {
      console.error("Delete email error:", error);
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  app.get("/api/emails/search/:query", requireAuth, async (req: any, res) => {
    try {
      const query = req.params.query;
      const emails = await storage.searchEmails(req.user.id, query);
      res.json(emails);
    } catch (error) {
      console.error("Search emails error:", error);
      res.status(500).json({ message: "Failed to search emails" });
    }
  });

  // API эндпоинты для управления собственным почтовым сервером
  app.get("/api/admin/mail-server/status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const status = mailServer.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting mail server status:", error);
      res.status(500).json({ message: "Failed to get mail server status" });
    }
  });

  app.post("/api/admin/mail-server/start", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { port } = req.body;
      await mailServer.start(port || 2525); // Используем порт 2525 для разработки
      
      res.json({ 
        message: "Mail server started successfully",
        status: mailServer.getStatus()
      });
    } catch (error) {
      console.error("Error starting mail server:", error);
      res.status(500).json({ message: "Failed to start mail server" });
    }
  });

  app.post("/api/admin/mail-server/stop", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      await mailServer.stop();
      
      res.json({ 
        message: "Mail server stopped successfully",
        status: mailServer.getStatus()
      });
    } catch (error) {
      console.error("Error stopping mail server:", error);
      res.status(500).json({ message: "Failed to stop mail server" });
    }
  });

  app.post("/api/admin/mail-server/send", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (userId !== 'support') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { from, to, subject, body } = req.body;
      
      if (!from || !to || !subject || !body) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await mailServer.sendEmail(from, to, subject, body);
      
      res.json({ message: "Email sent successfully via LITIUM Mail Server" });
    } catch (error) {
      console.error("Error sending email via mail server:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  const httpServer = createServer(app);
  
  // SMTP сервер теперь запускается только через админ-панель
  // чтобы не мешать веб-интерфейсу
  
  return httpServer;
}