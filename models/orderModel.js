import mongoose from 'mongoose';

const User = {
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  email: String,
};

const Product = {
  _id: String,
  name: String,
  amount: Number,
  category: String,
  qty: Number,
  price: Number,
  imageUrl: String,
};
const DeliveryMethod = {
  price: String,
  name: String,
};
const orderSchema = new mongoose.Schema({
  user: {
    type: User,
    required: false,
  },
  name: { type: String, require: true },
  surname: { type: String, require: true },
  companyName: { type: String, require: false },
  street: { type: String, require: true },
  zipCode: { type: String, require: true },
  city: { type: String, require: true },
  phone: { type: String, require: true },
  email: { type: String, required: true },
  message: { type: String, required: false },
  paymentMethod: { type: String, required: true },
  deliveryMethod: { type: DeliveryMethod, required: true },
  price: { type: Number, require: true },
  date: { type: Date, require: true },
  products: {
    type: [Product],
    required: true,
  },
  paid: { type: Boolean, default: false },
});
export default mongoose.model('OrderSchema', orderSchema);
