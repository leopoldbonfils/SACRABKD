const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

/**
 * Send a transactional email via Brevo.
 * @param {Object} opts
 * @param {string}   opts.to          - Recipient email
 * @param {string}   opts.toName      - Recipient name
 * @param {string}   opts.subject     - Email subject
 * @param {string}   opts.htmlContent - HTML body
 * @param {string}  [opts.textContent]- Plain-text fallback
 */
const sendEmail = async ({ to, toName, subject, htmlContent, textContent }) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name:  process.env.BREVO_SENDER_NAME || 'SACRA',
  };

  sendSmtpEmail.to = [{ email: to, name: toName || '' }];
  sendSmtpEmail.subject     = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  if (textContent) sendSmtpEmail.textContent = textContent;

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendEmail };
