const express = require('express');
const { renderQuote } = require('../controllers/inspire.controller');
const router = express.Router();

router.get('/', renderQuote);
module.exports = router;