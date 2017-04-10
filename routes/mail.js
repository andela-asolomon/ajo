var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'solomon.olayinka.ayoola@gmail.com',
    pass: '********'
  }
})

function mailOptions (data) {
  return {
    from: '"Ajo" <solomon.olayinka.ayoola@gmail.com>',
    to: data.email,
    subject: 'Welcome to Ajo',
    html: '<div>' +
      '<h4> Welcome to Ajó, the world best cylic money saving method. </h4>' +
      '<p> Your account details are email = ' + data.email + ' and password = ' + data.password + '</p>' +
      '<p> Please login to access your account and start saving. </p>' +
      '<p> Thanks for choosing Ajo </p>' +
      '</div>'
  }
}

var mail = {
  newUser: function (data) {
    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOptions(data), function (error, info) {
        if (error) {
          return reject(error)
        }

        return resolve(info.response)
      })
    })
  }
}

module.exports = mail
