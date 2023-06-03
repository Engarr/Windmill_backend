import express from 'express';
const router = express.Router();
import { signup, login, changePassword } from '../controllers/auth.js';
import { body } from 'express-validator';
import User from '../models/user.js';
import isAuth from '../middleware/is-auth.js';

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage(' Proszę podać poprawny adres e-mail.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Adres email już istnieje!');
          }
        });
      })
      .normalizeEmail()
      .trim(),
    body(
      'password',
      'Hasło musi zawierać co najmniej jedną wielką literę i jeden znak specjalny oraz byc dłuższe niz 5 znaków'
    )
      .isLength({ min: 5 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/),
    body('repeatPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject('Hasła muszą być identyczne');
      }
      return true;
    }),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Proszę podać poprawny adres e-mail.'),
    body('password', 'To pole nie może być puste').trim().not().isEmpty(),
  ],
  login
);
router.put(
  '/change-password',
  [
    body(
      'newPassword',
      'Hasło musi zawierać co najmniej jedną wielką literę i jeden znak specjalny oraz byc dłuższe niz 5 znaków'
    )
      .isLength({ min: 5 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/),
    body('repeatNewPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        return Promise.reject('Hasła muszą być identyczne');
      }
      return true;
    }),
  ],
  isAuth,
  changePassword
);

export default router;
