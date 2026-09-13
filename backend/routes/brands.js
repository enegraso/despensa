const express = require('express');
const router = express.Router();
const { list, create, update, remove } = require('../controllers/brandController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/', authMiddleware, list);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
