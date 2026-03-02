import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplateService {
  getVerificationEmail(verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Welcome to RideFolio - Verify Your Email</title>
      <style>
        :root {
        color-scheme: light dark;
        }
        
        /* Base styles */
        body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        }
        
        /* Light mode (default) */
        .email-body {
        background-color: #ffffff;
        padding: 20px 10px;
        }
        
        .email-container {
        max-width: 480px;
        margin: 0 auto;
        }
        
        .email-card {
        background-color: #ffffff;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
        }
        
        .logo-section {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e5e5e5;
        }
        
        .logo {
        font-size: 24px;
        font-weight: 700;
        color: #ff8c00!important;
        text-decoration: none;
        letter-spacing: -0.5px;
        }
        
        .email-title {
        font-size: 22px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 8px 0;
        text-align: center;
        }
        
        .email-subtitle {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 24px 0;
        text-align: center;
        }
        
        .email-content {
        color: #334155;
        font-size: 14px;
        }
        
        .email-content p {
        margin: 0 0 16px 0;
        }
        
        .greeting {
        font-size: 16px;
        font-weight: 500;
        color: #1e293b;
        }
        
        .button-container {
        text-align: center;
        margin: 28px 0;
        }
        
        .verify-button {
        display: inline-block;
        padding: 14px 32px;
        background-color: #ff8c00;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: background-color 0.2s;
        }
        
        .verify-button:hover {
        background-color: #e67e00;
        }
        
        .link-section {
        background-color: #fafafa;
        border-radius: 8px;
        padding: 16px;
        margin-top: 24px;
        }
        
        .link-label {
        font-size: 12px;
        color: #64748b;
        margin: 0 0 8px 0;
        }
        
        .link-url {
        font-size: 12px;
        color: #ff8c00;
        word-break: break-all;
        margin: 0;
        }
        
        .expiry-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 20px;
        padding: 10px;
        background-color: #fffbeb;
        border-radius: 6px;
        font-size: 12px;
        color: #92400e;
        }
        
        .security-notice {
        margin-top: 24px;
        padding: 16px;
        background-color: #f0fdf4;
        border-radius: 8px;
        border-left: 3px solid #22c55e;
        }
        
        .security-title {
        font-size: 12px;
        font-weight: 600;
        color: #166534;
        margin: 0 0 4px 0;
        display: flex;
        align-items: center;
        gap: 6px;
        }
        
        .security-text {
        font-size: 12px;
        color: #15803d;
        margin: 0;
        }
        
        .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e5e5;
        text-align: center;
        }
        
        .footer-text {
        font-size: 12px;
        color: #94a3b8;
        margin: 0 0 8px 0;
        }
        
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
        .email-body {
          background-color: #030303 !important;
        }
        
        .email-card {
          background-color: #0a0a0a !important;
          border-color: #262626 !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4) !important;
        }
        
        .logo-section {
          border-bottom-color: #262626 !important;
        }
        
        .logo {
          color: #d97706 !important;
        }
        
        .email-title,
        .greeting {
          color: #e5e5e5 !important;
        }
        
        .email-subtitle {
          color: #a3a3a3 !important;
        }
        
        .email-content {
          color: #d4d4d4 !important;
        }
        
        .verify-button {
          background-color: #d97706 !important;
        }
        
        .link-section {
          background-color: #171717 !important;
        }
        
        .link-label {
          color: #a3a3a3 !important;
        }
        
        .link-url {
          color: #d97706 !important;
        }
        
        .expiry-notice {
          background-color: #1c1917 !important;
          color: #fbbf24 !important;
        }
        
        .security-notice {
          background-color: #052e16 !important;
          border-left-color: #22c55e !important;
        }
        
        .security-title {
          color: #4ade80 !important;
        }
        
        .security-text {
          color: #86efac !important;
        }
        
        .footer {
          border-top-color: #262626 !important;
        }
        
        .footer-text {
          color: #737373 !important;
        }
        }
      </style>
      </head>
      <body>
      <div class="email-body">
        <div class="email-container">
        <div class="email-card">
          <!-- Logo Section -->
          <div class="logo-section">
          <a href="#" class="logo">
            RideFolio
          </a>
          </div>
          
          <!-- Header -->
          <h1 class="email-title">Verify Your Email Address</h1>
          <p class="email-subtitle">One quick step to get started</p>
          
          
          <!-- CTA Button -->
          <div class="button-container">
          <a href="${verificationUrl}" class="verify-button">Verify My Email</a>
          </div>
          
          <!-- Alternative Link -->
          <div class="link-section">
          <p class="link-label">Or copy and paste this link into your browser:</p>
          <p class="link-url">${verificationUrl}</p>
          </div>
          
          <!-- Expiry Notice -->
          <div class="expiry-notice">
          <span>This verification link expires in 24 hours</span>
          </div>
          
          <!-- Security Notice -->
          <div class="security-notice">
          <p class="security-title">
            Security Notice
          </p>
          <p class="security-text">If you didn't create an account with RideFolio, you can safely ignore this email. No account will be created without verification.</p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
          <p class="footer-text">Need help? Contact our support team anytime.</p>
          </div>
        </div>
        </div>
      </div>
      </body>
    </html>
    `;
  }

  getChangeEmailVerificationEmail(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #ff8c00;
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Confirm Your New Email Address</h2>
            <p>You requested to change your email address. Please confirm this change by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Confirm Email Change</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't request this change, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
