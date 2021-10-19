const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ''
    },

})

blogSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});


exports.Blog = mongoose.model('Blog', blogSchema);