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

  async sendOtpVerificationEmail({ userEmail, otp }: { userEmail: string; otp: string }) {
    try {
      await this.sendEmail({
        to: userEmail,
        subject: 'Your RideFolio verification code',
        html: this.emailTemplates.getOtpVerificationEmail(otp),
        text: `Your RideFolio verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      });

      this.logger.log(`📧 Sent OTP verification email to ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP verification email to ${userEmail}`, error);
      throw new Error('Failed to send OTP verification email');
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
