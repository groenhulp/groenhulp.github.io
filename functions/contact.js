import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// ---------- 0. Авторизация Google Sheets ----------
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    client_email: process.env.GS_CLIENT_EMAIL,
    private_key: process.env.GS_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const spreadsheetId = process.env.GS_SHEET_ID;

// ---------- 1. handler ----------
export async function handler(event) {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: 'Method Not Allowed' };

  const { name, email, phone = '', message } = JSON.parse(event.body || '{}');

  // 2. валидация
  if (!name || !email || !message)
    return { statusCode: 422, body: 'Missing fields' };

  // 3. запись в Google Sheets
  await sheets.spreadsheets.values.append({
    auth: await auth.getClient(),
    spreadsheetId,
    range: 'Form!A:E',
    valueInputOption: 'RAW',
    requestBody: { values: [[new Date().toISOString(), name, email, phone, message]] }
  });

  // 4. письмо
  const t = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await t.sendMail({
    from: `"GroenHulp" <${process.env.SMTP_USER}>`,
    to: 'groenhulplimburg@gmail.com',
    subject: 'Nieuwe aanvraag van website',
    text: `${name} (${phone})\n${email}\n\n${message}`
  });

  // 5. ответ клиенту
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}
