import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from 'src/email/emailTemplate.service';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevo: BrevoClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplates: EmailTemplateService,
  ) {
    this.brevo = new BrevoClient({
      apiKey: this.configService.get<string>('BREVO_API_KEY')!,
    });
  }

  async sendEmailVerification({ userEmail, token, url }: { userEmail: string; token: string; url: string }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.sendEmail({
        to: userEmail,
        subject: 'Verify your email for RideFolio',
        html: this.emailTemplates.getVerificationEmail(url),
        text: `Please verify your email by clicking the following link: ${verificationUrl}`,
      });

      this.logger.log(`📧 Sent email verification to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${userEmail}`, error);
      throw new Error('Failed to send verification email');
    }
  }

  private async sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
    await this.brevo.transactionalEmails.sendTransacEmail({
      sender: {
        email: this.configService.get<string>('BREVO_SENDER_EMAIL'),
        name: this.configService.get<string>('BREVO_SENDER_NAME'),
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text,
    });
  }
}
