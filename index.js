const express = require('express')

const pkg = require('./package.json')

const port = Number(process.env['PORT'] || '3000')
const app = express()

app.get('/version', async (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
})

app.listen(port, () => console.log(`http://localhost:${port}/`))
