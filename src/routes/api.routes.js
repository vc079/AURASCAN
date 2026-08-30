const express = require("express");
const router = express.Router();
const apiKeyAuth = require("../middleware/apiKey.js");
const { exportLogsCsv } = require("../controllers/export.controller.js");

router.get('/export/logs', apiKeyAuth, exportLogsCsv);

module.exports = router;
