import Product from '../models/product.js';
import User from '../models/user.js';
import OrderSchema from '../models/orderModel.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const addToCart = async (req, res, next) => {
  const userId = req.body.userId;
  const quantity = req.body.quantity;
  const productId = req.body.productId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Nie udało się odnaleźć użytkownika.');
      error.statusCode = 404;
      throw error;
    }
    const existingItem = user.cart.find((prod) => prod.productId === productId);
    if (!existingItem) {
      user.cart.push({ productId: productId, quantity: quantity });
    } else {
      existingItem.quantity = existingItem.quantity + quantity;
    }

    await user.save();
    res.status(200).json();
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const getCartProducts = async (req, res, next) => {
  const userId = req.userId;
  if (userId !== 'notregistered') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('Nie udało się odnaleźć użytkownika.');
        error.statusCode = 404;
        throw error;
      }
      const userCart = user.cart;

      const promises = userCart.map(async (item) => {
        const product = await Product.findById(item.productId);
        return { product: product, quantity: item.quantity };
      });
      const prodArr = await Promise.all(promises);
      res.status(200).json({ prodArr: prodArr });
    } catch (err) {
      if (!err) {
        err.statusCode = 500;
      }
      next(err);
    }
  } else {
    res.status(200).json({ prodArr: [] });
  }
};
export const removeProduct = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Nie udało się odnaleźć użytkownika.');
      error.statusCode = 404;
      throw error;
    }
    const product = user.cart.find((item) => item.productId === productId);
    if (!product) {
      const error = new Error('Nie udało się odnaleźć produktu.');
      error.statusCode = 404;
      throw error;
    }
    await user.cart.pull(product);
    await user.save();
    res.status(200).json({ message: 'Produkt został usunięty z koszyka' });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const increaseQty = async (req, res, next) => {
  const userId = req.userId;

  const productId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Nie udało się odnaleźć użytkownika.');
      error.statusCode = 404;
      throw error;
    }

    const product = user.cart.find((item) => item.productId === productId);
    if (!product) {
      const error = new Error('Nie udało się odnaleźć produktu.');
      error.statusCode = 404;
      throw error;
    }
    product.quantity += 1;
    await user.save();
    res.status(200).json();
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const decreaseQty = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Nie udało się odnaleźć użytkownika.');
      error.statusCode = 404;
      throw error;
    }

    const product = user.cart.find((item) => item.productId === productId);
    if (!product) {
      const error = new Error('Nie udało się odnaleźć produktu.');
      error.statusCode = 404;
      throw error;
    }
    if (product.quantity <= 1) {
      await user.cart.pull(product);
      await user.save();
    } else {
      product.quantity--;
    }
    await user.save();
    res.status(200).json();
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const postOrder = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }
  const productsArr = req.body.productsArr;
  const paymentMethod = req.body.paymentMethod;
  const deliveryMethod = req.body.deliveryMethod;
  const token = req.body.token;

  try {
    const {
      name,
      surname,
      companyName,
      street,
      zipCode,
      city,
      phone,
      message,
      email,
    } = req.body;

    const mappedProducts = productsArr.map((product) => ({
      _id: product.product._id,
      name: product.product.name,
      category: product.product.category,
      price: product.product.price,
      imageUrl: product.product.imageUrl,
      quantity: product.quantity,
    }));
    let userId;
    let user;

    if (token) {
      const decodedToken = jwt.decode(token, process.env.VITE_SECRET_TOKEN);
      userId = await decodedToken.userId;
      user = await User.findById(userId);
    }

    const newOrder = new OrderSchema({
      _id: new mongoose.Types.ObjectId(),
      user: { email, userId },
      name,
      surname,
      companyName,
      street,
      zipCode,
      city,
      phone,
      message,
      email,
      products: mappedProducts,
      paymentMethod,
      deliveryMethod: {
        name: deliveryMethod.name,
        price: deliveryMethod.price,
      },
      date: new Date(),
      paid: false,
    });

    await newOrder.save();
    if (user) {
      user.orders.push(newOrder._id);
      await user.save();
    }

    res.status(201).json({ orderId: newOrder._id });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const deleteCart = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Nie udało się odnaleźć użytkownika.');
      error.statusCode = 404;
      throw error;
    }
    user.cart = [];
    await user.save();
    res.status(200).json();
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
