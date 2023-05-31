import express from 'express';
const router = express.Router();
import isAuth from '../middleware/is-auth.js';
import getUserId from '../middleware/get-userId.js';

import {
  addToCart,
  getCartProducts,
  removeProduct,
  increaseQty,
  decreaseQty,
} from '../controllers/cartFeed.js';

router.put('/addToCart', addToCart);
router.get('/getCartProducts', getUserId, getCartProducts);
router.put('/product-incQty/:id', getUserId, increaseQty);
router.put('/product-decQty/:id', getUserId, decreaseQty);
router.delete('/deleteProduct', isAuth, removeProduct);
export default router;
