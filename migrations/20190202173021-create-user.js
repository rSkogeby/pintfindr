exports.up = async function (db) {
  await db.runSql(`
    CREATE TABLE "user" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "handle" text UNIQUE NOT NULL,
      "email" text UNIQUE NOT NULL,
      "password_digest" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT transaction_timestamp()
    )
  `)
}

exports.down = async function () {
  throw new Error('Not implemented')
}
