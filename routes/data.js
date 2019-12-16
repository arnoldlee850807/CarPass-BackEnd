const express = require('express')
const router = express.Router()

router.get('/messages', (req, res) => {
    cpnsole.log("....")
    res.end()
})

module.exports = router