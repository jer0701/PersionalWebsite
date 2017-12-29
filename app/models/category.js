// Category model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    papers: { type: Number },
    describe: { type: String },
    created: { type: Date }
});

mongoose.model('Category', CategorySchema);
