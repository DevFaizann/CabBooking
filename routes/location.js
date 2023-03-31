const express = require("express");
const { addressPredictions, distance } = require("../controllers/location");

const router = express.Router();

router.get("/:address", addressPredictions);
router.get("/:pickup/:destination", distance);

module.exports = router;