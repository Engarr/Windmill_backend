import express from 'express';
const router = express.Router();
import isAuth from '../middleware/is-auth.js';
import getUserId from '../middleware/get-userId.js';

import {
  addToCart,
  getCartProducts,
  removeProduct,
  increaseQty,
} from '../controllers/cartFeed.js';

router.put('/addToCart', addToCart);
router.get('/getCartProducts', getUserId, getCartProducts);
router.put('/product/:id', getUserId, increaseQty);
router.delete('/deleteProduct', isAuth, removeProduct);
export default router;
