const express = require('express');
const router = express.Router();
const { lookup, confirm, confirmEntry, listByProduct } = require('../controllers/stockMovementController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/lookup/:codigo_barras', authMiddleware, lookup);
router.post('/confirm', authMiddleware, confirm);
router.post('/confirm-entry', authMiddleware, confirmEntry);
router.get('/product/:articulo_id', authMiddleware, listByProduct);

module.exports = router;
