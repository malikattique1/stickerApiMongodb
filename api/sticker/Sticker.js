var mongoose = require('mongoose');  

var StickerSchema = new mongoose.Schema({  
  name: String,
  stickerpack_id: String,
  user_id: String,
  privacy: String,
  sticker_path: String,
// sticker_path: [{
//   public_id: {
//       type: String,
//   },
//   url: {
//       type: String,
//   }
// }],
  country: String,
  pack_order: String,
  is_paid: String,
  tags_sticker: String,
});
mongoose.model('Sticker', StickerSchema);

module.exports = mongoose.model('Sticker');
