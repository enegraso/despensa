const express = require('express');
const router = express.Router();
const { list, getByBarcode, create, update, remove } = require('../controllers/productController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/', authMiddleware, list);
router.get('/barcode/:codigo_barras', authMiddleware, getByBarcode);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
