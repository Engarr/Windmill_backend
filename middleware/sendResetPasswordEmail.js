import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (userEmail, resetCode) => {
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
    from: process.env.EMAIL,
    to: userEmail,
    subject: 'Resetowanie hasła',
    text: `Twój kod resetowania hasła: ${resetCode}`,
    html: `<p>Twój kod resetowania hasła: <strong>${resetCode}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
