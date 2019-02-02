const DBMigrate = require('db-migrate')

exports.deploy = async function () {
  try {
    await DBMigrate.getInstance(true).up()
  } catch (err) {
    throw (err.originalErr || err)
  }
}
