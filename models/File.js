const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
 
const FileSchema = new Schema(
    {
        author: ObjectId,
        title: String,
        body: String,
        date: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('File', FileSchema);