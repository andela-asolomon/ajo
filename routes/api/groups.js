var router = require('express').Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Group = mongoose.model('Group');
var User = mongoose.model('User');
var auth = require('../auth');

// prefetch group and add to request
router.param('id', function(req, res, next, id) {
  Group.findById(id)
    .then(function (group) {
      if (!group) { return res.sendStatus(404); }

      req.group = group;

      return next();
    }).catch(next);
});

// get all groups
router.get('/', auth.optional, function(req, res, next) {
  Group.find({}).then(function(groups) {
    if (!groups) { return res.sendStatus(404); }

    return res.json({
      groups: groups,
    })
  })
});

// get a single group
router.get('/:id', auth.required, function(req, res, next) {
  if (req.payload) {
    return res.json({
      group: req.group,
    })
  }
});

// delete a group
router.delete('/:id', auth.required, function(req, res, next) {
  if (req.payload) {
    return req.group.remove().then(function() {
      res.sendStatus(204)
    });
  }
});

// create group
router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var group = new Group(req.body);
    group.author = user;

    return user.addToGroup(group._id).then(function() {
      return group.save().then(function(){
        return res.json({group: group.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// create users into a group
router.post('/:id/users', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if (req.body.users.length === 0) {
      return res.status(422).json({errors: {users: "must not be empty"}});
    }

    User.insertMany(req.body.users).then(function(users) {
      return res.json({
        users: users.map(function(user) {
          user.addToGroup(req.group.id).then(function() {
            return user;
          })
        })
      })
    }).catch(next);
  }).catch(next);
});

module.exports = router;
