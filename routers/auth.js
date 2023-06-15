import express from 'express';
const router = express.Router();
import {
  signup,
  login,
  changePassword,
  changeEmail,
  getMessage,
  putCreateResetCode,
  putVerifyCode,
  putNewPassword,
  getOrderById,
  getOrders,
} from '../controllers/auth.js';
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
    body('oldPassword', 'Pole stare hasło nie może byc puste')
      .trim()
      .not()
      .isEmpty(),
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
router.put(
  '/change-email',
  [
    body('password', 'Pole z hasłem nie może być puste').trim().not().isEmpty(),
    body('newEmail')
      .isEmail()
      .withMessage('Proszę podać poprawny adres e-mail.'),
  ],
  isAuth,
  changeEmail
);
router.put(
  '/contact',
  [
    body('subject', 'Proszę podać tytuł wiaodmości').trim().not().isEmpty(),
    body('userName', 'Pole z imieniem nie może być puste')
      .trim()
      .not()
      .isEmpty(),
    body('email').isEmail().withMessage('Proszę podać poprawny adres e-mail.'),
    body('message', 'Pole z wiaodmścią nie może być puste')
      .trim()
      .not()
      .isEmpty(),
  ],
  getMessage
);
router.put(
  '/reset-send',
  [body('email').isEmail().withMessage('Proszę podać poprawny adres e-mail.')],
  putCreateResetCode
);
router.put(
  '/send-code',
  [body('code', 'Pole z kodem nie może być puste').trim().not().isEmpty()],
  putVerifyCode
);
router.put(
  '/send-new-password',
  [
    body(
      'newPassword',
      'Hasło musi zawierać co najmniej jedną wielką literę i jeden znak specjalny oraz byc dłuższe niz 5 znaków'
    )
      .isLength({ min: 5 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/),
    body('repeatPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        return Promise.reject('Hasła muszą być identyczne');
      }
      return true;
    }),
  ],
  putNewPassword
);
router.get('/getOrder/:orderId', isAuth, getOrderById);
router.get('/getOrders', isAuth, getOrders);
export default router;
