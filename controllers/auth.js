import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
    });
    const result = await user.save();
    res.status(201).json({ message: 'Użytkownik został utworzony' });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
      err.message = 'Coś poszło nie tak...';
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error(
        'Nie można znaleźć użytkownika o tym adresie e-mail'
      );
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Hasło jest nie poprawne!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.VITE_SECRET_TOKEN,
      { expiresIn: '48h' }
    );
    res.status(200).json({
      token: token,
      email: loadedUser.email,
      userId: loadedUser._id.toString(),
    });
  } catch (err) {
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }

  const userId = req.userId;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error(
        'Użytkownik z podanym adresem e mail nie istnieje'
      );
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(oldPassword, user.password);
    if (!isEqual) {
      const error = new Error('Podane hasło nie jest poprawne.');
      error.statusCode = 401;
      throw error;
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({ message: 'Hasło zostało zmeinione.' });
  } catch (err) {
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};
export const changeEmail = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }

  const userId = req.userId;
  const password = req.body.password;
  const newEmail = req.body.newEmail;
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error(
        'Użytkownik z podanym adresem e mail nie istnieje'
      );
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Podane hasło nie jest poprawne.');
      error.statusCode = 401;
      throw error;
    }

    user.email = newEmail;
    await user.save();
    res.status(200).json({ message: 'Email zostało zmeiniony.' });
  } catch (err) {
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};
export const getMessage = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }
  const userName = req.body.userName;
  const userEmail = req.body.email;
  const message = req.body.message;
  const subject = req.body.subject;
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
  const mailToMeOptions = {
    from: userEmail,
    to: process.env.EMAIL,
    subject: subject,
    text: `Wiadomość od ${userName}!\n\n${message}\n\n${userEmail}`,
  };

  const mailToUserOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject,
    text: `Dziękujemy otrzymaliśmy Twoją wiadomość. Odpowiemy na pytanie jak najszybciej będzie to możliwe.`,
  };
  try {
    await transporter.sendMail(mailToMeOptions);
    await transporter.sendMail(mailToUserOptions);
    res.status(200).json({ message: 'Widomość została wysłana poprawnie.' });
  } catch (err) {
    console.error('Błąd podczas wysyłania wiadomości e-mail:', err);
    return res
      .status(500)
      .json({ error: 'Wystąpił błąd podczas wysyłania wiadomości e-mail.' });
  }
};
