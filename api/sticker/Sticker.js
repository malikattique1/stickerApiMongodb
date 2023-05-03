var mongoose = require('mongoose');  

var StickerSchema = new mongoose.Schema({  
  name: String,
  stickerpack_id: String,
  user_id: String,
  rating: String,
  downloads: String,
  download_size: String,
  privacy: String,
  sticker_path: String,
  country: String,
  pack_order: String,
  is_paid: String,
  tags_sticker: String,
  searched: String,
  added: String,
});
mongoose.model('Sticker', StickerSchema);

module.exports = mongoose.model('Sticker');
