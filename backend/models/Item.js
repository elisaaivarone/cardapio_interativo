const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  category: { type: String, required: true },
  menu: {
    type: String,
    required: true,
    enum: ['breakfast', 'allDay']
  }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;