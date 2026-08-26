const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirect.controller');

// This catches anything like /r/daily-quote or /r/promo
router.get('/:slug', handleRedirect);

module.exports = router;