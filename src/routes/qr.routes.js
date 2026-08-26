const express = require('express');
const { renderQr } = require('../controllers/qr.controller');
const router = express.Router();

router.get('/', renderQr);
module.exports = router;