var mongoose = require('mongoose')
var router = require('express').Router()
var passport = require('passport')
var User = mongoose.model('User')
var auth = require('../auth')

router.param('id', function (req, res, next, id) {
  User.findById(id)
    .then(function (user) {
      if (!user) { return res.sendStatus(404) }

      req.user = user

      return next()
    }).catch(next)
})

router.get('/users', auth.optional, function (req, res, next) {
  User.find({}).populate('groups').then(function (users) {
    if (!users) { return res.sendStatus(401) }

    return res.json({
      users: users.map(function (user) {
        return user.toProfileJSONFor()
      })
    })
  }).catch(next)
})

router.get('/users/:id', auth.required, function (req, res, next) {
  if (req.payload) {
    return res.json({
      user: req.user
    })
  }
})

router.delete('/users/:id', auth.required, function (req, res, next) {
  if (req.payload) {
    req.user.remove().then(function () {
      return res.sendStatus(204)
    })
  }
})

router.get('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    return res.json({user: user.toAuthJSON()})
  }).catch(next)
})

router.put('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }
    // only update fields that were actually passed...
    if (typeof req.body.firstName !== 'undefined') {
      user.firstName = req.body.firstName
    }
    if (typeof req.body.lastName !== 'undefined') {
      user.lastName = req.body.lastName
    }
    if (typeof req.body.email !== 'undefined') {
      user.email = req.body.email
    }
    if (typeof req.body.mobileNumber !== 'undefined') {
      user.mobileNumber = req.body.mobileNumber
    }
    if (typeof req.body.dateOfBirth !== 'undefined') {
      user.dateOfBirth = req.body.dateOfBirth
    }
    if (typeof req.body.address !== 'undefined') {
      user.address = req.body.address
    }
    if (typeof req.body.password !== 'undefined') {
      user.setPassword(req.body.password)
    }

    return user.save().then(function () {
      return res.json({user: user.toAuthJSON()})
    })
  }).catch(next)
})

router.post('/users/login', function (req, res, next) {
  if (!req.body.email) {
    return res.status(422).json({errors: {email: 'required'}})
  }

  if (!req.body.password) {
    return res.status(422).json({errors: {password: 'required'}})
  }

  passport.authenticate('local', {session: false}, function (err, user, info) {
    if (err) { return next(err) }

    if (user) {
      user.token = user.generateJWT()
      return res.json({user: user.toAuthJSON()})
    } else {
      return res.status(422).json(info)
    }
  })(req, res, next)
})

router.post('/users', function (req, res, next) {
  var body = req.body
  var user = new User()

  user.firstName = body.firstName
  user.lastName = body.lastName
  user.mobileNumber = body.mobileNumber
  user.email = body.email
  user.address = body.address
  user.dateOfBirth = body.dateOfBirth
  user.setPassword(body.password)

  user.save().then(function () {
    return res.json({user: user.toAuthJSON()})
  }).catch(next)
})

module.exports = router
