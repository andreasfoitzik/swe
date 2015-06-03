var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salesSchema = new Schema ({
    applicationID: Schema.ObjectId,
    kaeufer: String,
    containerTyp: String,
    containerAmount: String,
    containerTransport: String,
    saleReturn: Number,
    saleProfitCB: Number,
    saleDate: String
});

module.exports = mongoose.model('sales', salesSchema);