import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { storage } from './storage';
import nodemailer from 'nodemailer';

export class LitiumMailServer {
  private smtpServer: SMTPServer;
  private isRunning = false;
  private config = {
    port: 2525,
    secure: false,
    authRequired: false, // Разрешить анонимные соединения для получения внешних писем
    maxClients: 100,
    maxConnections: 100
  };

  constructor() {
    this.smtpServer = new SMTPServer({
      // Требуется аутентификация
      authRequired: this.config.authRequired,
      
      // Разрешить небезопасные соединения (для разработки)
      secure: this.config.secure,
      
      // Аутентификация пользователей
      onAuth: this.handleAuth.bind(this),
      
      // Обработка входящих писем
      onData: this.handleData.bind(this),
      
      // Валидация отправителя
      onMailFrom: this.handleMailFrom.bind(this),
      
      // Валидация получателя
      onRcptTo: this.handleRcptTo.bind(this),
      
      // Настройки сервера
      banner: 'LITIUM.SPACE Mail Server',
      hostname: 'mail.litium.space',
      
      // Ограничения
      size: 10 * 1024 * 1024, // 10MB максимальный размер письма
      
      // Логирование
      logger: console,
    });
  }

  // Аутентификация пользователей (опциональна для внешних писем)
  private async handleAuth(auth: any, session: any, callback: any) {
    try {
      // Для внешних писем разрешаем подключение без аутентификации
      if (!auth.username || !auth.password) {
        callback(null, { user: 'external' });
        return;
      }
      
      // Извлекаем username из email адреса
      const username = auth.username.split('@')[0];
      
      // Проверяем пользователя в базе данных
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return callback(new Error('Authentication failed - user not found'));
      }

      // Проверяем пароль
      const isValid = await storage.validateUser(username, auth.password);
      
      if (!isValid) {
        return callback(new Error('Authentication failed - invalid password'));
      }

      // Сохраняем информацию о пользователе в сессии
      session.user = user;
      callback(null, { user: auth.username });
    } catch (error) {
      console.error('Auth error:', error);
      callback(new Error('Authentication failed'));
    }
  }

  // Валидация отправителя
  private async handleMailFrom(address: any, session: any, callback: any) {
    try {
      // Проверяем, что отправитель аутентифицирован
      if (!session.user) {
        return callback(new Error('Authentication required'));
      }

      // Проверяем, что отправитель соответствует аутентифицированному пользователю
      const senderUsername = address.address.split('@')[0];
      if (senderUsername !== session.user.username) {
        return callback(new Error('Sender address does not match authenticated user'));
      }

      callback();
    } catch (error) {
      console.error('MailFrom error:', error);
      callback(new Error('Invalid sender'));
    }
  }

  // Валидация получателя
  private async handleRcptTo(address: any, session: any, callback: any) {
    try {
      const recipientEmail = address.address;
      const domain = recipientEmail.split('@')[1];

      // Если письмо для нашего домена, проверяем существование пользователя
      if (domain === 'litium.space') {
        const username = recipientEmail.split('@')[0];
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return callback(new Error('User not found'));
        }
      }
      
      // Разрешаем отправку для внешних доменов (relay)
      callback();
    } catch (error) {
      console.error('RcptTo error:', error);
      callback(new Error('Invalid recipient'));
    }
  }

  // Обработка входящих писем
  private async handleData(stream: any, session: any, callback: any) {
    try {
      // Парсим входящее письмо
      const parsed = await simpleParser(stream);
      
      const fromEmail = parsed.from?.text || '';
      const toEmail = parsed.to?.text || '';
      const subject = parsed.subject || 'Без темы';
      const body = parsed.html || parsed.text || '';
      
      console.log(`Incoming email: ${fromEmail} -> ${toEmail}: ${subject}`);
      
      // Обработка писем для @litium.space пользователей
      if (toEmail.includes('@litium.space')) {
        const recipientUsername = toEmail.split('@')[0];
        const { storage } = await import('./storage');
        
        // Проверяем существование получателя
        const recipient = await storage.getUserByUsername(recipientUsername);
        
        if (recipient) {
          // Определяем отправителя
          let fromUserId = 'external';
          
          if (fromEmail.includes('@litium.space')) {
            // Внутренний пользователь
            const senderUsername = fromEmail.split('@')[0];
            const sender = await storage.getUserByUsername(senderUsername);
            if (sender) {
              fromUserId = sender.id;
            }
          } else {
            // Внешний отправитель - создаем временного пользователя
            try {
              let externalUser = await storage.getUserByEmail(fromEmail);
              if (!externalUser) {
                const externalUsername = fromEmail.split('@')[0] + '_external';
                externalUser = await storage.createUser({
                  username: externalUsername,
                  email: fromEmail,
                  password: 'external_user',
                  firstName: fromEmail.split('@')[0],
                  lastName: null
                });
              }
              fromUserId = externalUser.id;
            } catch (error) {
              console.error('Error creating external user:', error);
              fromUserId = 'external';
            }
          }
          
          // Сохраняем письмо в базу данных
          await storage.sendEmail(fromUserId, {
            toEmail: toEmail,
            subject: subject,
            body: body
          });
          
          console.log(`Email delivered: ${fromEmail} -> ${toEmail}`);
        } else {
          console.log(`Recipient ${recipientUsername} not found`);
        }
      }
      
      callback();
    } catch (error) {
      console.error('Data handling error:', error);
      callback(new Error('Failed to process email'));
    }
  }

  // Запуск SMTP сервера
  public async start(port: number = 25): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.smtpServer.listen(port, () => {
          this.isRunning = true;
          console.log(`LITIUM Mail Server running on port ${port}`);
          resolve();
        });
      } catch (error) {
        console.error('Failed to start mail server:', error);
        reject(error);
      }
    });
  }

  // Остановка сервера
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isRunning) {
        this.smtpServer.close(() => {
          this.isRunning = false;
          console.log('LITIUM Mail Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Отправка писем через внешний SMTP (для отправки на внешние адреса)
  public async sendEmail(from: string, to: string, subject: string, body: string): Promise<void> {
    try {
      // Для внешних адресов используем внешний SMTP
      const domain = to.split('@')[1];
      
      if (domain === 'litium.space') {
        // Для внутренних адресов сохраняем в базу данных напрямую
        console.log(`Internal email from ${from} to ${to}: ${subject}`);
        
        // Найти пользователя-получателя и сохранить письмо в базу
        const { storage } = await import('./storage');
        const recipientUsername = to.split('@')[0];
        const recipient = await storage.getUserByUsername(recipientUsername);
        
        if (recipient) {
          // Сохраняем письмо как внутреннее
          await storage.sendEmail('support', {
            toEmail: to,
            subject: subject,
            body: body
          });
        }
      } else {
        // Для внешних адресов используем настройки SMTP из админ панели
        const { storage } = await import('./storage');
        const smtpSettings = await storage.getMailServerSettings();
        
        if (smtpSettings && smtpSettings.isActive) {
          // Создаем транспорт с настройками из админ панели
          const transporter = nodemailer.createTransporter({
            host: smtpSettings.smtpHost,
            port: smtpSettings.smtpPort,
            secure: smtpSettings.smtpSecure,
            auth: {
              user: smtpSettings.smtpUser,
              pass: smtpSettings.smtpPassword,
            },
          });

          await transporter.sendMail({
            from,
            to,
            subject,
            html: body,
          });

          console.log(`External email sent: ${from} -> ${to}`);
        } else {
          console.log(`External email delivery failed: No SMTP settings configured`);
          console.log(`Configure SMTP settings in admin panel to enable external email delivery`);
          throw new Error('SMTP settings not configured for external email delivery');
        }
      }
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  // Получение статуса сервера
  public getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.config.port,
      config: this.config,
    };
  }
}

// Создаем глобальный экземпляр почтового сервера
export const mailServer = new LitiumMailServer();