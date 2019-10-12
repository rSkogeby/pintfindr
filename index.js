const bcrypt = require('bcrypt')
const createError = require('http-errors')
const createValidator = require('is-my-json-valid')
const express = require('express')
const getJsonBody = require('@body/json')
const jsonwebtoken = require('jsonwebtoken')
const pg = require('pg')

const pkg = require('./package.json')

const app = express()
const pool = new pg.Pool()
const port = Number(process.env['PORT'] || '3000')

const JWT_SECRET = process.env['JWT_SECRET']

function parseToken (token) {
  try {
    return jsonwebtoken.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw createError(401, 'Expired token given')
    } else {
      throw createError(401, 'Invalid token given')
    }
  }
}

const validatePostSession = createValidator({
  type: 'object',
  properties: {
    email: { type: 'string', minLength: 1 },
    password: { type: 'string' }
  },
  required: [
    'email',
    'password'
  ]
})

const validatePostBeerPrice = createValidator({
  type: 'object',
  properties: {
    venue: { type: 'string', minLength: 1 },
    beer: { type: 'string', minLength: 1 },
    price: { type: 'number', multipleOf: 1 },
    lat: { type: 'number' },
    lng: { type: 'number' }
  },
  required: [
    'venue',
    'beer',
    'price',
    'lat',
    'lng'
  ]
})

app.get('/version', async (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
})

app.post('/session', async (req, res) => {
  const body = await getJsonBody(req)

  if (!validatePostSession(body)) {
    throw createError(400, { errors: validatePostSession.errors })
  }

  const { rows } = await pool.query('SELECT id, handle, email, password_digest FROM "user" WHERE email = $1', [body.email])

  if (rows.length === 0) {
    throw createError(403)
  }

  const isValidPassword = await bcrypt.compare(body.password, rows[0].password_digest)

  if (!isValidPassword) {
    throw createError(403)
  }

  const payload = { sub: rows[0].id, handle: rows[0].handle }
  const options = { algorithm: 'HS256', expiresIn: '24h' }

  const token = jsonwebtoken.sign(payload, JWT_SECRET, options)

  res.json({ token, handle: rows[0].handle })
})

app.get('/beer-prices', async (req, res) => {
  const { rows } = await pool.query(`SELECT id, venue, beer, price, lat, lng FROM price`)

  res.json(rows)
})

app.post('/beer-prices', async (req, res) => {
  if (!req.headers['authorization']) throw createError(403)
  if (!req.headers['authorization'].startsWith('Bearer ')) throw createError(403)
  const auth = parseToken(req.header['authorization'].replace('Bearer ', ''))

  const body = await getJsonBody(req)

  if (!validatePostBeerPrice(body)) {
    throw createError(400, { errors: validatePostBeerPrice.errors })
  }

  await pool.query(`INSERT INTO price (venue, beer, price, lat, lng) VALUES ($1, $2, $3, $4, $5)`, [body.venue, body.beer, body.price, body.lat, body.lng])

  res.status(201).end()
})

app.listen(port, () => console.log(`http://localhost:${port}/`))
