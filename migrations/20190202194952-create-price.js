exports.up = async function (db) {
  await db.runSql(`
    CREATE TABLE "price" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "venue" text NOT NULL,
      "beer" text NOT NULL,
      "price" int NOT NULL,
      "lat" float NOT NULL,
      "lng" float NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT transaction_timestamp()
    )
  `)
}

exports.down = async function () {
  throw new Error('Not implemented')
}
