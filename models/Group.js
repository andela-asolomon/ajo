const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const cycle = require('../utils//cycle')

const GroupSchema = new mongoose.Schema({
  name: {type: String, unique: true, required: [true, 'This field is required']},
  intervals: {type: Number, required: [true, 'This field is required']},
  cycle: {type: String, enum: ['days', 'months', 'years'], required: [true, 'This field is required']},
  amountPerMember: {type: Number, required: [true, 'This field is required']},
  amountPerCycle: Number,
  memberTotal: Number,
  description: String,
  cycleStartDate: Date,
  cycleEndDate: Date,
  cycleCurrentMemberToBePaid: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true})

GroupSchema.plugin(uniqueValidator, {message: 'is already taken'})

GroupSchema.methods.toJSONFor = function (user) {
  return {
    id: this._id,
    name: this.name,
    intervals: this.intervals,
    cycle: this.cycle,
    description: this.description,
    amountPerMember: this.amountPerMember,
    amountPerCycle: this.amountPerCycle,
    memberTotal: this.memberTotal,
    cycleStartDate: this.cycleStartDate,
    cycleEndDate: this.cycleEndDate,
    cycleCurrentMemberToBePaid: this.cycleCurrentMemberToBePaid,
    members: this.members,
    admin: user ? this.admin.toProfileJSONFor(user) : this.admin
  }
}

GroupSchema.methods.addMember = function (users) {
  const group = this
  users.forEach(function(userId, index) {
    if (group.members.indexOf(userId) === -1) {
      group.members.push(userId)
    }
  })
  return this.save()
}

GroupSchema.methods.startCycle = function () {
  const group = this
  const { amountPerCycle, cycleStartDate, cycleEndDate, memberTotal, cycleCurrentMemberToBePaid } = cycle.start(group)

  if (!group.cycleStartDate) {
    group.amountPerCycle = amountPerCycle
    group.cycleStartDate = cycleStartDate
    group.cycleEndDate = cycleEndDate
    group.memberTotal = memberTotal
    group.cycleCurrentMemberToBePaid = cycleCurrentMemberToBePaid
  }
  return group.save()
}

GroupSchema.methods.endCycle = function () {
  const group = this
  const { amountPerCycle, cycleStartDate, cycleEndDate, memberTotal, cycleCurrentMemberToBePaid } = cycle.end()

  if (group.cycleStartDate && group.cycleEndDate) {
    group.amountPerCycle = amountPerCycle
    group.cycleStartDate = cycleStartDate
    group.cycleEndDate = cycleEndDate
    group.memberTotal = memberTotal
    group.cycleCurrentMemberToBePaid = cycleCurrentMemberToBePaid
  }
  return group.save()
}

mongoose.model('Group', GroupSchema)
