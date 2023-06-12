import express from 'express';
const router = express.Router();
import isAuth from '../middleware/is-auth.js';
import getUserId from '../middleware/get-userId.js';
import { body } from 'express-validator';

import {
  addToCart,
  getCartProducts,
  removeProduct,
  increaseQty,
  decreaseQty,
  postOrder,
} from '../controllers/cartFeed.js';

router.put('/addToCart', addToCart);
router.get('/getCartProducts', getUserId, getCartProducts);
router.put('/product-incQty/:id', getUserId, increaseQty);
router.put('/product-decQty/:id', getUserId, decreaseQty);
router.delete('/deleteProduct', isAuth, removeProduct);
router.post(
  '/send-order',
  [
    body('name').notEmpty().trim().withMessage('Wprowadź dane'),
    body('surename').notEmpty().trim().withMessage('Wprowadź dane'),
    body('city').notEmpty().trim().withMessage('Wprowadź dane'),
    body('street').notEmpty().trim().withMessage('Wprowadź dane'),
    body('zipCode')
      .notEmpty()
      .trim()
      .withMessage('Wprowadź dane')
      .matches(/^\d{2}-\d{3}$/)
      .withMessage('Poprawny format to XX-XXX'),
    body('phone')
      .notEmpty()
      .trim()
      .withMessage('Wprowadź dane')
      .matches(/^\+?\d{0,3}?\d{9}$/)
      .withMessage('Nieprawidłowy numer telefonu'),
    body('email')
      .isEmail()
      .withMessage(' Proszę podać poprawny adres e-mail.')
      .normalizeEmail()
      .trim(),
    body('status')
      .equals('true')
      .withMessage(' Musisz zaakceptować regulamin.'),
  ],
  postOrder
);
export default router;
