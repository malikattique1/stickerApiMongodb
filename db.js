var mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/stickerapp', { useMongoClient: true });

mongoose.connect(`mongodb+srv://attiqueurrehmannew12:5251050@cluster0.ifmxcrl.mongodb.net/Stickerapp?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log("Mongoose Connected");
}).catch((error) => {
    console.log(error);
});

