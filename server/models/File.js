const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
 
const FileSchema = new Schema(
    {
        owner: String,
        mode: String,
        data: Buffer,
        private_url: { type: String, unique: true },
        public_url: String,
        size: Number,
        removedAt: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('File', FileSchema);