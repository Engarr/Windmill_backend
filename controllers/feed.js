import Product from '../models/product.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { storage } from '../config/firebase.config.js';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const getUser = async (req, res, next) => {
  const userId = req.userId;
  res.status(200).json({ userId: userId });
};

export const postAddProduct = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }
  const image = req.file;
  if (!image || image.length === 0) {
    const error = new Error('Nie wybrano pliku zdjęciowego.');
    error.statusCode = 422;
    throw error;
  }
  const metadata = {
    contentType: req.file.mimetype,
  };
  const storageRef = ref(storage, `images/${uuidv4() + image.originalname}`);
  const snapshot = await uploadBytesResumable(
    storageRef,
    image.buffer,
    metadata
  );
  const imageUrl = await getDownloadURL(snapshot.ref);

  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const description = req.body.description;
  const userId = req.body.userId;

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: name,
    price: price,
    description: description,
    category: category,
    creator: userId,
    imageUrl: imageUrl,
  });
  try {
    const result = await product.save();
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 422;
      throw error;
    }
    user.products.push(product._id);
    await user.save();
    res.status(200).json({ message: 'product has been created', data: result });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const editProduct = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({ errors: error.array() });
  }

  const productId = req.body.productId;
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const description = req.body.description;
  const creatorId = req.body.creatorId;
  const image = req.file;
  console.log(name);
  let imageUrl = req.body.imageUrl;
  try {
    if (image) {
      const metadata = {
        contentType: req.file.mimetype,
      };
      const desertRef = ref(storage, imageUrl);
      await deleteObject(desertRef);
      const newStorageRef = ref(
        storage,
        `images/${uuidv4() + image.originalname}`
      );
      const snapshot = await uploadBytesResumable(
        newStorageRef,
        image.buffer,
        metadata
      );
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
    }

    if (creatorId.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.imageUrl = imageUrl;
    const result = await product.save();
    res.status(200).json({ message: 'Product updated!', product: result });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const productsData = await Product.find();
    res.status(200).json({
      message: 'Fetched products successfully.',
      products: productsData,
    });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const getCategoryProducts = async (req, res, next) => {
  const category = req.params.category;

  try {
    const products = await Product.find({ category: category });
    res
      .status(200)
      .json({ message: 'Fetched products successfully.', products: products });
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
export const getProductDetails = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const productDetail = await Product.findById(
      new mongoose.Types.ObjectId(productId)
    );

    if (!productDetail) {
      res.status(422).json({ message: 'Nie ma takiego produktu.' });
    } else {
      res.status(200).json({ productDetail: productDetail });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

// export const getLocalStorageProducts = async (req, res, next) => {
//   const ids = req.query.ids;
//   if (ids) {
//     const idArr = ids.split(',');
//     try {
//       const products = await Product.find({ _id: { $in: idArr } });
//       res.status(200).json({ products: products });
//     } catch (err) {
//       if (!err) {
//         err.statusCode = 500;
//       }
//       next(err);
//     }
//   } else {
//     res.status(200).json({ products: [] });
//   }
// };

export const deleteProduct = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Could not find product');
      error.statusCode = 404;
      throw error;
    }
    if (product.creator.toString() !== userId.toString()) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    const desertRef = ref(storage, product.imageUrl);
    await deleteObject(desertRef);
    await Product.findByIdAndRemove(productId);
    const user = await User.findById(userId);
    await user.products.pull(productId);
    await user.save();
    res.status(200).json({ message: 'Product deleted.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
