/**
 * Forwarder: Redirect all legacy imports of resend.service.js to email.service.js (Nodemailer)
 *
 * Resend has been completely replaced by Nodemailer.
 */

export * from './email.service.js';
