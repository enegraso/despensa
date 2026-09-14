const express = require('express');
const router = express.Router();
const { consumptionReport, purchasesReport, priceList, replenishmentList } = require('../controllers/reportController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/consumption', authMiddleware, consumptionReport);
router.get('/purchases', authMiddleware, purchasesReport);
router.get('/replenishment', authMiddleware, replenishmentList);
router.get('/prices', authMiddleware, priceList);

module.exports = router;
