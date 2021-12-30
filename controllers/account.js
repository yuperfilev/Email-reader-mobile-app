var imaps = require('imap-simple');
const crypto = require('crypto');
const iv = Buffer.from("email-reader-api"); //Вектор инициализации
const key = crypto.scryptSync('testword', 'sflpr9fhi2', 32);

function Config(options, flag) {
  const model = {
    imap: {
      user: options.email,
      password: decryptPassword(options.password, flag),
      host: getHostbyEmail(options.email),
      port: 993,
      tls: true,
      authTimeout: 5000
    }
  }
  return model
}

function getHostbyEmail(email) {
  var arr = email.split('@')
  return 'imap.' + arr[arr.length - 1]
}

const validateAccount = (req, res) => {
  if (!req.body) res.sendStatus(400)
  var config = Config(req.body, true)
  imaps.connect(config)
  .then(function (connection) {
    connection.openBox('INBOX')
      .then(() => {
	res.status(200).send({"message": "Account is valid"})
      })
      .catch(()=>{
        res.sendStatus(404)
      })
  })
  .catch(function () {
    res.status(404).send({ "message": "Account doesn't exist or IMAP access not allowed" })
  })
}

const addAccount = (req, res) => {
  if (!req.body) res.sendStatus(400)
  var config = Config(req.body, false)
  imaps.connect(config).then(function (connection) {
    connection.openBox('INBOX')
    .then(()=>{
      let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
      let encyptedData = cipher.update(req.body.password, 'utf8', 'hex')
      encyptedData += cipher.final('hex')
      res.send({"message": encyptedData})
    })
    .catch(()=>{
      res.sendStatus(404)
    })
  })
  .catch(() => {
    res.status(404).send({ "message": "Account doesn't exist or IMAP access not allowed" })
  })
}

function decryptPassword(password, flag){
  if (flag === false) {
    return password
  }
  else{
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decryptedData = decipher.update(password, 'hex', 'utf-8')
    decryptedData += decipher.final('utf-8')
    return decryptedData
  }

}

module.exports = {
  validateAccount, addAccount,  Config
}
