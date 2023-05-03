var mongoose = require('mongoose');  

var StickerpackSchema = new mongoose.Schema({  
  name: String,
  owner: String,
  privacy: String,
  tray_icon: String,
  country: String,
  poster_icon: String,
  pack_category: String,
  is_paid: String,
  is_animated: String,
});
mongoose.model('Stickerpack', StickerpackSchema);

module.exports = mongoose.model('Stickerpack');
