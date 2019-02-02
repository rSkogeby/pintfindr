exports.up = async function (db) {
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)
}

exports.down = async function () {
  throw new Error('Not implemented')
}
