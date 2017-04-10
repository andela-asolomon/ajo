var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')

var GroupSchema = new mongoose.Schema({
  name: {type: String, unique: true, required: [true, 'This field is required']},
  periods: {type: Number, required: [true, 'This field is required']},
  cycle: {type: String, enum: ['days', 'months', 'years'], required: [true, 'This field is required']},
  amount: {type: Number, required: [true, 'This field is required']},
  description: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true})

GroupSchema.plugin(uniqueValidator, {message: 'is already taken'})

GroupSchema.methods.toJSONFor = function (user) {
  return {
    id: this._id,
    name: this.name,
    periods: this.periods,
    cycle: this.cycle,
    description: this.description,
    amount: this.amount,
    author: user ? this.author.toProfileJSONFor(user) : this.author
  }
}

GroupSchema.methods.addMember = function (userId) {
  if (this.members.indexOf(userId) === -1) {
    this.members.push(userId)
  }
  return this.save()
}

mongoose.model('Group', GroupSchema)
