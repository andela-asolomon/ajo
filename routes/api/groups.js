const router = require('express').Router()
const mongoose = require('mongoose')
const Group = mongoose.model('Group')
const User = mongoose.model('User')
const auth = require('../auth')

// prefetch group and add to request
router.param('id', (req, res, next, id) => {
  Group.findById(id)
    .populate('admin')
    .then((group) => {
      if (!group) { return res.sendStatus(404) }

      req.group = group

      return next()
    }).catch(next)
})

router.param('userId', (req, res, next, userId) => {
  User.findById(userId)
    .then((user) => {
      if (!user) { return res.sendStatus(404) }

      req.user = user

      return next()
    }).catch(next)
})

// get all groups
router.get('/', auth.optional, (req, res, next) => {
  Group.find({}).then((groups) => {
    if (!groups) { return res.sendStatus(404) }

    return res.json({
      groups: groups
    })
  }).catch(next)
})

// create group
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = new Group(req.body)
    group.admin = user

    return group.save().then(() => {
      return res.json({group: group.toJSONFor(user)})
    }).catch(next)
  }).catch(next)
})

// get a single group
router.get('/:id', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      return res.json({
        group: group.toJSONFor(user)
      })
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// update a group
router.put('/:id', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const fields = ['name', 'description', 'intervals', 'cycle', 'amountPerMember']
    const body = req.body
    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      if (group.cycleStartDate && group.cycleEndDate) {
        return res.json({
          message: 'You cannot update an on-going cycle'
        })
      } else {
        fields.forEach((field) => {
          if (typeof body[field] !== 'undefined') {
            group[field] = body[field]
          }
        })

        group.save().then((updatedGroup) => {
          return res.json({group: updatedGroup.toJSONFor(user)})
        }).catch(next)
      }
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// delete a group
router.delete('/:id', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      return group.remove().then(() => {
        return res.sendStatus(204)
      }).catch(next)
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// add user(s) to a group
router.post('/:id/users', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      if (group.cycleStartDate && group.cycleEndDate) {
        return res.json({
          message: 'Saving cycle already started. You cannot more users in this cycle',
        })
      } else {
        group.addMember(req.body.users).then(() => {
          return res.json({
            group: group.toJSONFor(user)
          })
        }).catch(next)
      }
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// remove user from a group
router.delete('/:id/users/:userId', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      if (group.cycleStartDate && group.cycleEndDate) {
        return res.json({
          message: 'Sorry, you cannot remove a user from an on-going cycle',
        })
      } else {
        group.members.remove(req.user._id)
        group.save().then(() => {
          return req.user.removeFromGroup(group._id).then(() => {
            return res.json({
              group: group.toJSONFor(user)
            })
          })
        }).catch(next)
      }
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

// starting a cycle
router.post('/:id/start-cycle', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      if (group.cycleStartDate && group.cycleEndDate) {
        return res.json({
          message: 'This cycle is already started'
        })
      } else {
        if (group.members.length > 1) {
          group.startCycle().then(() => {
            return res.json({
              group: group.toJSONFor(user)
            })
          }).catch(next)
        } else {
          return res.json({
            message: 'Group members must be more than one to begin a cycle'
          })
        }
      }
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})

router.delete('/:id/end-cycle', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) { return res.sendStatus(401) }

    const group = req.group

    if (group.admin._id.toString() === req.payload.id.toString()) {
      if (group.cycleStartDate && group.cycleEndDate) {
        group.endCycle().then(() => {
          return res.json({
            group: group.toJSONFor(user)
          })
        }).catch(next)
      } else {
        return res.json({
          message: 'You cannot end a cycle that has not been started yet 👻'
        })
      }
    } else {
      return res.sendStatus(403)
    }
  }).catch(next)
})


module.exports = router
