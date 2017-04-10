var router = require('express').Router()
var mongoose = require('mongoose')
var Group = mongoose.model('Group')
var User = mongoose.model('User')
var auth = require('../auth')

// prefetch group and add to request
router.param('id', function (req, res, next, id) {
  Group.findById(id)
    .populate('author')
    .then(function (group) {
      if (!group) { return res.sendStatus(404) }

      req.group = group

      return next()
    }).catch(next)
})

router.param('userId', function (req, res, next, userId) {
  User.findById(userId)
    .then(function (user) {
      if (!user) { return res.sendStatus(404) }

      req.user = user

      return next()
    }).catch(next)
})

// get all groups
router.get('/', auth.optional, function (req, res, next) {
  Group.find({}).then(function (groups) {
    if (!groups) { return res.sendStatus(404) }

    return res.json({
      groups: groups
    })
  })
})

// create group
router.post('/', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    var group = new Group(req.body)
    group.author = user

    return group.addMember(user._id).then(function () {
      return user.addToGroup(group._id).then(function () {
        return group.save().then(function () {
          return res.json({group: group.toJSONFor(user)})
        })
      })
    }).catch(next)
  }).catch(next)
})

// get a single group
router.get('/:id', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    return res.json({
      group: req.group.toJSONFor(user)
    })
  }).catch(next)
})

// update a group
router.put('/:id', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    var fields = ['name', 'description', 'periods', 'cycle', 'amount']
    var body = req.body
    var group = req.group

    if (group.author._id.toString() === req.payload.id.toString()) {
      fields.forEach(function (field) {
        if (typeof body[field] !== 'undefined') {
          group[field] = body[field]
        }
      })

      group.save().then(function (updatedGroup) {
        return res.json({group: updatedGroup.toJSONFor(user)})
      }).catch(next)
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// delete a group
router.delete('/:id', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    var group = req.group

    if (group.author._id.toString() === req.payload.id.toString()) {
      return group.remove().then(function () {
        return res.sendStatus(204)
      })
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// invite user to group
router.post('/:id/users', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) { return res.sendStatus(401) }

    var group = req.group
    if (group.author._id.toString() === req.payload.id.toString()) {

      var newUser = new User(req.body)
      var password = newUser.generatePassword()
      newUser.setPassword(password)

      newUser.save().then(function () {
        const data = { email: newUser.email, password: password }
        return newUser.sendEmail(data).then(function(response) {
            return newUser.addToGroup(group._id).then(function () {
              return group.addMember(newUser._id).then(function () {
                return res.json({
                  group: group.toJSONFor(user)
                })
              })
            })
          })
        }).catch(next)
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

router.delete('/:id/users/:userId', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401) }

    var group = req.group
    if (group.author._id.toString() === req.payload.id.toString()) {
      group.members.remove(req.user._id)
      group.save().then(function() {
        return req.user.removeFromGroup(group._id).then(function() {
          return res.json({
            group: group.toJSONFor(user)
          })
        })
      }).catch(next)
    }
  }).catch(next)
})

module.exports = router
