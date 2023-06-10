import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email, resetCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.PASSWORD_EMAIL,
    to: email,
    subject: 'Resetowanie hasła',
    text: `Twój kod resetowania hasła: ${resetCode}`,
    html: `<p>Twój kod resetowania hasła: <strong>${resetCode}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
