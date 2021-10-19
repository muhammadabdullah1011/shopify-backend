const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],


});

bannerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

bannerSchema.set('toJSON', {
    virtuals: true,
});

exports.Banner = mongoose.model('Banner', bannerSchema);
exports.bannerSchema = bannerSchema;
