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
  deleteCart,
} from '../controllers/cartFeed.js';

router.put('/addToCart', addToCart);
router.get('/getCartProducts', getUserId, getCartProducts);
router.put('/product-incQty/:id', getUserId, increaseQty);
router.put('/product-decQty/:id', getUserId, decreaseQty);
router.delete('/deleteProduct', isAuth, removeProduct);
router.post(
  '/send-order',
  [
    body('name').trim().not().isEmpty().withMessage('Wprowadź dane'),
    body('surname').trim().not().isEmpty().withMessage('Wprowadź dane'),
    body('city').trim().not().isEmpty().withMessage('Wprowadź dane'),
    body('street').trim().not().isEmpty().withMessage('Wprowadź dane'),
    body('zipCode')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Wprowadź dane')
      .matches(/^\d{2}\d{3}$/)
      .withMessage('Poprawny format: XXXXX'),
    body('phone')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Wprowadź dane')
      .matches(/^\+?\d{0,3}?\d{9}$/)
      .withMessage('Nieprawidłowy numer telefonu'),
    body('email')
      .isEmail()
      .withMessage(' Podaj poprawny adres e-mail.')
      .normalizeEmail()
      .trim(),
    body('status')
      .equals('true')
      .withMessage(' Musisz zaakceptować regulamin.'),
  ],
  postOrder
);
router.delete('/clearCart', isAuth, deleteCart);
export default router;
