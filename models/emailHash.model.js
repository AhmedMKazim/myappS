const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const EmialHashSchema = new Schema({
    email: { type: String, required: true},
    activeCode: { type: String, required: true, createIndexes: { unique: true } },
},
{
    timestamps: true
}
);
module.exports = mongoose.model('EmailsHashs', EmialHashSchema);
