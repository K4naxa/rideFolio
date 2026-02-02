import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from 'src/email/emailTemplate.service';
import * as Brevo from '@getbrevo/brevo';
import { UserSession } from '@thallesp/nestjs-better-auth';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailApi: Brevo.TransactionalEmailsApi;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplates: EmailTemplateService,
  ) {
    this.emailApi = new Brevo.TransactionalEmailsApi();
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not defined in environment variables');
    }
    this.emailApi.setApiKey(0, apiKey);
  }

  async sendEmailVerification({
    user,
    userEmail,
    token,
    url,
  }: {
    user: UserSession['user'];
    userEmail: string;
    token: string;
    url: string;
  }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.sendEmail({
        to: userEmail,
        subject: 'Verify your email for RideFolio',
        html: this.emailTemplates.getVerificationEmail(url, user.name),
        text: `Please verify your email by clicking the following link: ${verificationUrl}`,
      });

      this.logger.log(`📧 Sent email verification to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${userEmail}`, error);
      throw new Error('Failed to send verification email');
    }
  }

  private async sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
    const email = new Brevo.SendSmtpEmail();
    email.sender = {
      email: this.configService.get<string>('BREVO_SENDER_EMAIL'),
      name: this.configService.get<string>('BREVO_SENDER_NAME'),
    };
    email.subject = subject;
    email.htmlContent = html;
    email.to = [{ email: to }];
    email.textContent = text;

    await this.emailApi.sendTransacEmail(email);
  }
}
