const Contact = require('../models/Contact');
const { sendEmail } = require('../config/brevo');

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin/Editor)
exports.getAll = async (req, res) => {
  try {
    const messages = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reply = async (req, res) => {
  const { message: replyContent } = req.body;

  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.replyMessage = replyContent;
    message.isRead = true; // replying automatically marks it as read
    await message.save();

    // Send real reply email to the user
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your-brevo-api-key-here') {
      try {
        await sendEmail({
          to:     message.email,
          toName: message.name,
          subject: `Re: ${message.subject} — SACRA`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
              <div style="background: #1d4ed8; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                <h2 style="color: #fff; margin: 0; font-size: 20px;">SACRA — Reply to Your Enquiry</h2>
              </div>
              <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #475569; margin: 0 0 16px;">Hi <strong>${message.name}</strong>,</p>
                <p style="color: #475569; margin: 0 0 24px;">Thank you for reaching out to SACRA. Here is our response to your enquiry:</p>
                <div style="background: #fff; border-left: 4px solid #1d4ed8; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                  <p style="margin: 0; color: #1e293b; line-height: 1.6;">${replyContent.replace(/\n/g, '<br/>')}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  This reply is in response to your message submitted on ${new Date(message.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.<br/>
                  Students' Anesthetist Collaborative Research Association (SACRA) — Kibogora Polytechnic, Rwanda
                </p>
              </div>
            </div>
          `,
          textContent: `Hi ${message.name},\n\nThank you for contacting SACRA. Here is our reply:\n\n${replyContent}\n\n— SACRA Team`
        });
        console.log(`[BREVO] Reply email sent to: ${message.email}`);
      } catch (emailErr) {
        console.error('[BREVO] Failed to send reply email:', emailErr.message);
        // Don't fail the request — reply is already saved to DB
      }
    } else {
      console.log(`[BREVO] API key not configured. Reply saved to DB but email NOT sent to: ${message.email}`);
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnread = async (req, res) => {
  try {
    const count = await Contact.count({ where: { isRead: false } });
    res.json(count); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const inquiry = await Contact.create({ name, email, phone, subject, message });

    // Send admin notification email via Brevo
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your-brevo-api-key-here') {
      try {
        await sendEmail({
          to:     process.env.SACRA_ADMIN_EMAIL,
          toName: 'SACRA Admin',
          subject: `📬 New Contact Message: ${subject}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
              <div style="background: #1d4ed8; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                <h2 style="color: #fff; margin: 0; font-size: 20px;">📬 New Contact Message — SACRA</h2>
              </div>
              <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 100px;"><strong>Name</strong></td>
                    <td style="padding: 8px 0; color: #1e293b;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px;"><strong>Email</strong></td>
                    <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1d4ed8;">${email}</a></td>
                  </tr>
                  ${phone ? `<tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px;"><strong>Phone</strong></td>
                    <td style="padding: 8px 0; color: #1e293b;">${phone}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px;"><strong>Subject</strong></td>
                    <td style="padding: 8px 0; color: #1e293b;">${subject}</td>
                  </tr>
                </table>
                <div style="background: #fff; border-left: 4px solid #1d4ed8; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                  <p style="margin: 0; color: #1e293b; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Received: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}<br/>
                  Reply to this message in the <a href="http://localhost:3001/contact" style="color: #1d4ed8;">SACRA Admin Dashboard</a>.
                </p>
              </div>
            </div>
          `,
          textContent: `New contact message from ${name} (${email})\n\nSubject: ${subject}\n\n${message}\n\nReceived: ${new Date().toISOString()}`
        });
        console.log(`[BREVO] Admin notification sent for message from: ${email}`);
      } catch (emailErr) {
        console.error('[BREVO] Failed to send admin notification:', emailErr.message);
        // Don't fail the request — message is already saved to DB
      }
    } else {
      console.log(`[BREVO] API key not configured. Message saved to DB. Set BREVO_API_KEY in .env to enable emails.`);
    }

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
