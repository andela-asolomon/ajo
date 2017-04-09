var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var User = mongoose.model('User');

var GroupSchema = new mongoose.Schema({
  name: {type: String, unique: true, required: [true, "This field is required"]},
  periods: {type: Number, required: [true, "This field is required"]},
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true});

GroupSchema.plugin(uniqueValidator, {message: 'is already taken'});

GroupSchema.methods.toJSONFor = function(user) {
  return {
    id: this._id,
    name: this.name,
    periods: this.periods,
    description: this.description,
    author: this.author.toProfileJSONFor(user),
  }
}

mongoose.model('Group', GroupSchema);
