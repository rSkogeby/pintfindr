const express = require('express')
const app = express()
app.get('/v1/locations', (req, res, next) => {
    res.sendFile('locations.json')
})

app.listen(3000, () => {
    console.log('http://localhost:3000/')
})