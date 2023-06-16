import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import TokenModel from '../models/tokenModel.js';
import { generateResetCode } from '../middleware/generateResetCode.js';
import OrderSchema from '../models/orderModel.js';

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
      const error = new Error('Hasło jest niepoprawne!');
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
export const putCreateResetCode = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    res.status(422).json({ errors: error.array() });
  }
  const userEmail = req.body.email;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }
    const resetCode = generateResetCode();
    await TokenModel.create({ user: user._id, token: resetCode });

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

    return res.status(200).json({
      message:
        'Wiadomość z kodem resetowania hasła została wysłana na adres email',
    });
  } catch (err) {
    res.status(500).json({ error: 'Wystąpił błąd serwera' });
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};
export const putVerifyCode = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    res.status(422).json({ errors: error.array() });
  }
  const token = req.body.code;

  try {
    const tokenDoc = await TokenModel.findOne({ token });
    if (!tokenDoc) {
      res.status(400).json({
        errors: { error: { code: 'Nieprawidłowy kod resetowania hasła' } },
      });
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
      res.status(404).json({
        errors: { error: { code: 'Użytkownik nie istnieje' } },
      });
    }

    res.status(200).json({ userId: user._id });
  } catch (err) {
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};
export const putNewPassword = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    res.status(422).json({ errors: error.array() });
  }
  const userId = req.body.userId;
  const newPassword = req.body.newPassword;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Użytkownik nie istnieje');
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
export const getOrderById = async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json();
      const error = new Error('Użytkownik nie istnieje');
      error.statusCode = 401;
      throw error;
    }
    const isOrder = user.orders.find(
      (order) => order._id.toString() === orderId.toString()
    );
    if (!isOrder) {
      res.status(401).json({
        message: 'Zamówienie nie jest przypisane do tego użytkownika',
      });
      const error = new Error('Brak autoryzacji');
      error.statusCode = 401;
      throw error;
    }
    const order = await OrderSchema.findById(orderId);
    if (!order) {
      e;
      const error = new Error('Brak zamówienia');
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json(order);
  } catch (err) {
    if (!err) {
      err.statusCode(500);
    }
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.sttaus(401).json();
      throw new Error('Nie udało się odnaleźć użytkownika');
    }
    const ordersId = user.orders;
    const OrdersDetails = await OrderSchema.find({ _id: { $in: ordersId } });

    res.status(200).json(OrdersDetails);
  } catch (err) {
    if (!err) {
      err.status(500);
    }
    next(err);
  }
};

export const addToWishlit = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({
        message: 'By dodać produkt do listy życzeń musisz się zalogować',
      });
      throw new Error('Nie udało się odnaleźć użytkownika');
    }
    user.wishLists.push(productId);
    await user.save();
    res.status(200).json({ message: 'Produkt został dodany do listy życzeń' });
  } catch (err) {
    if (!err) {
      err.status(500);
    }
    next(err);
  }
};
export const reomoveFromWishlit = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({
        message: 'Aby usunąć produkt z listy życzeń musisz się zalogować',
      });
      throw new Error('Nie udało się odnaleźć użytkownika');
    }
    user.wishLists.pull(productId);
    await user.save();
    res.status(200).json({ message: 'Produkt został usunięty z listy życzeń' });
  } catch (err) {
    if (!err) {
      err.status(500);
    }
    next(err);
  }
};
export const isOnWishlist = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.sttaus(401).json({
        message: 'Uzytkownik nie istnieje',
      });
      throw new Error('Nie udało się odnaleźć użytkownika');
    }

    const isProduct = user.wishLists.some(
      (product) => product.toString() === productId.toString()
    );

    res.status(200).json({
      isOnWishlist: isProduct,
    });
  } catch (err) {
    if (!err) {
      err.status(500);
    }
    next(err);
  }
};
