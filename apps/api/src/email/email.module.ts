import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { EmailTemplateService } from 'src/email/emailTemplate.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailTemplateService],
  exports: [EmailService],
})
export class EmailModule {}
