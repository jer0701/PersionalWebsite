// post model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' }, //关联key, mongod是一个非关系型数据库, 这个ref表现了弱关联
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed }, //nested
    comments: [ Schema.Types.Mixed ],  //nested
    created: { type: Date }
});

mongoose.model('Post', PostSchema);
