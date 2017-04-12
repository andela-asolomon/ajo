const moment = require('moment')

const cycle = {
  start: ({ amountPerMember, memberTotal, intervals, members, cycle }) => {
    const total = memberTotal || members.length
    return {
      amountPerCycle: amountPerMember * total,
      cycleStartDate: moment(),
      cycleEndDate: moment().add(total * intervals, cycle),
      memberTotal: total,
      cycleCurrentMemberToBePaid: members[0]
    }
  },
  end: () => {
    return {
      amountPerMember: undefined,
      cycleStartDate: undefined,
      cycleEndDate: undefined,
      memberTotal: undefined,
      cycleCurrentMemberToBePaid: undefined
    }
  },
}

module.exports = cycle
