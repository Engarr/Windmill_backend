import express from 'express';

const router = express.Router();
import isAuth from '../middleware/is-auth.js';
import {
  getUser,
  postAddProduct,
  getProducts,
  getCategoryProducts,
  getProductDetails,
  editProduct,
  deleteProduct,
  // getLocalStorageProducts,
} from '../controllers/feed.js';
import { body } from 'express-validator';
import { imageValidator } from '../validation/validation.js';
import getUserId from '../middleware/get-userId.js';

import multer, { memoryStorage } from 'multer';
const upload = multer({ storage: memoryStorage() });

router.get('/user', getUserId, getUser);
router.post(
  '/add-product',
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Wpisz nazwę produktu'),
    body('image').custom(imageValidator),
    body('price')
      .notEmpty()
      .withMessage('To pole nie może byc puste')
      .isDecimal({ decimal_digits: '1,2' })
      .withMessage('Cena musi zawierać liczbę do 2 miejsc po przecinku')
      .isFloat({ min: 0.01 })
      .withMessage('Cena musi być liczbą dodatnią'),
    body('category', 'Proszę wybrać kategorię').notEmpty(),
    body('description')
      .notEmpty()
      .withMessage('Opis produktu nie może być pusty')
      .isLength({ max: 1000 })
      .withMessage('Opis produktu nie może być dłuższy niż 1000 znaków'),
  ],
  postAddProduct
);
router.get('/products', getProducts);
router.get('/products/:category', getCategoryProducts);
router.get('/product/:productId', getProductDetails);
// router.get('/storage', getLocalStorageProducts);
router.put(
  '/editProduct/:productId',
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Wpisz nazwę produktu'),
    body('image').custom(imageValidator),
    body('price')
      .notEmpty()
      .withMessage('To pole nie może byc puste')
      .isDecimal({ decimal_digits: '1,2' })
      .withMessage('Cena musi zawierać liczbę do 2 miejsc po przecinku')
      .isFloat({ min: 0.01 })
      .withMessage('Cena musi być liczbą dodatnią'),
    body('category', 'Proszę wybrać kategorię').notEmpty(),
    body('description')
      .notEmpty()
      .withMessage('Opis produktu nie może być pusty')
      .isLength({ max: 800 })
      .withMessage('Opis produktu nie może być dłuższy niż 500 znaków'),
  ],
  isAuth,
  editProduct
);
router.delete('/delete/:productId', isAuth, deleteProduct);

export default router;
