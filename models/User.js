var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var crypto = require('crypto')
var generator = require('generate-password')
var jwt = require('jsonwebtoken')
var mail = require('../routes/mail')
var secret = require('../config').secret

var UserSchema = new mongoose.Schema({
  firstName: {type: String, required: [true, 'This field is required']},
  lastName: {type: String, required: [true, 'This field is required']},
  mobileNumber: {type: String, lowercase: true, unique: true, required: [true, 'This field is required'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, 'This field is required'], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  dateOfBirth: {type: String, required: [true, 'This field is required']},
  address: {type: String, required: [true, 'This field is required']},
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  hash: String,
  salt: String
}, {timestamps: true})

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'})

UserSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
  return this.hash === hash
}

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

UserSchema.methods.generateJWT = function () {
  var today = new Date()
  var exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    id: this._id,
    exp: parseInt(exp.getTime() / 1000)
  }, secret)
}

UserSchema.methods.toAuthJSON = function () {
  return {
    email: this.email,
    token: this.generateJWT()
  }
}

UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    mobileNumber: this.mobileNumber,
    email: this.email,
    address: this.address,
    dateOfBirth: this.dateOfBirth,
    groups: this.groups
  }
}

UserSchema.methods.removeFromGroup = function (id) {
  this.groups.remove(id)
  return this.save()
}

UserSchema.methods.addToGroup = function (id) {
  if (this.groups.indexOf(id) === -1) {
    this.groups.push(id)
  }
  return this.save()
}

UserSchema.methods.isMember = function (id) {
  return this.groups.some(function (groupId) {
    return groupId.toString() === id.toString()
  })
}

UserSchema.methods.generatePassword = function () {
  var password = generator.generate({ length: 8, numbers: true })
  return password
}

UserSchema.methods.sendEmail = function (data) {
  return mail.newUser(data)
}

mongoose.model('User', UserSchema)
