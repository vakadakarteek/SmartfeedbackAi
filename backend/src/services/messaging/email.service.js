/**
 * Email Dispatch Service — Nodemailer (Exclusive Email Provider)
 *
 * Uses ONLY Nodemailer for sending emails via SMTP (Gmail, Outlook, custom SMTP).
 * Resend has been completely removed.
 */

import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = env.SMTP_USER || env.GMAIL_USER;
  const pass = env.SMTP_PASS || env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  try {
    if (env.SMTP_HOST) {
      // Custom SMTP configuration
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587', 10),
        secure: env.SMTP_SECURE === 'true' || env.SMTP_PORT === '465',
        auth: { user, pass },
      });
      logger.info(`Nodemailer initialized with custom SMTP host: ${env.SMTP_HOST}`);
    } else {
      // Default to Gmail service
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      logger.info(`Nodemailer initialized with Gmail SMTP for user: ${user}`);
    }

    return transporter;
  } catch (error) {
    logger.error('Failed to initialize Nodemailer transporter:', error.message);
    return null;
  }
}

function buildHtmlTemplate(subject, content) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e293b; margin-top: 0;">${subject}</h2>
      <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; color: #334155; line-height: 1.6; font-size: 15px;">
        ${content.replace(/\n/g, '<br/>')}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        Sent via <strong>SmartFeedback AI</strong> — Generate. Review. Share.
      </p>
    </div>
  `;
}

/**
 * Send an email to any recipient using Nodemailer
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} content - Email text/html content
 */
export async function sendEmail(email, subject = 'SmartFeedback AI Message', content = '') {
  if (!email) {
    return {
      success: false,
      provider: 'nodemailer',
      error: 'Recipient email is required',
    };
  }

  const activeTransporter = getTransporter();
  const senderEmail = env.SMTP_USER || env.GMAIL_USER || 'no-reply@smartfeedback.ai';
  const fromName = env.EMAIL_FROM_NAME || 'SmartFeedback AI';

  // If no credentials configured yet, return safe mock response so server never crashes
  if (!activeTransporter) {
    logger.warn(`Nodemailer SMTP credentials not configured in .env. Operating in mock mode for recipient ${email}`);
    logger.warn('👉 ACTION: Add GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_HOST, SMTP_USER, SMTP_PASS) to .env to enable live sending.');
    return {
      success: true,
      mode: 'mock',
      provider: 'nodemailer',
      providerMessageId: `mock-nodemailer-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      recipient: email,
      status: 'delivered',
    };
  }

  try {
    const formattedHtml = buildHtmlTemplate(subject, content);

    const info = await activeTransporter.sendMail({
      from: `"${fromName}" <${senderEmail}>`,
      to: email,
      subject,
      text: content,
      html: formattedHtml,
    });

    logger.info(`Nodemailer: email dispatched to ${email} (Message ID: ${info.messageId})`);

    return {
      success: true,
      mode: 'live',
      provider: 'nodemailer',
      providerMessageId: info.messageId,
      recipient: email,
      status: 'delivered',
    };
  } catch (error) {
    logger.error(`Nodemailer delivery error for ${email}:`, error.message);
    return {
      success: false,
      mode: 'live',
      provider: 'nodemailer',
      error: error.message,
      recipient: email,
      status: 'failed',
    };
  }
}
