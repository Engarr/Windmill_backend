import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

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
    res.status(201).json({ message: 'User has been created' });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
      err.message = 'something went wrong';
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
      const error = new Error('Could not find user with that email');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
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
      const error = new Error('Could not find user with that email');
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
