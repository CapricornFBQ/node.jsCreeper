var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//声明一个数据库 对象
var novelsDataSchema = new Schema({
    novelTitle: String,
    novelDownloadAddress: String,
    time: {
        date:String,
        year:Number,
        month:String,
        day:String,
        minute:String
    },
});
//暴露数据模型
module.exports = mongoose.model('novelsData', novelsDataSchema);