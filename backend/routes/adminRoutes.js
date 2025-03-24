const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Fix the import to properly destructure auth and checkRole
const { auth, checkRole } = require('../middleware/auth');

// Admin routes
router.get('/users', auth, checkRole(['admin']), adminController.getUsers);
router.post('/users', auth, checkRole(['admin']), adminController.createUser);
router.get('/users/:id', auth, checkRole(['admin']), adminController.getUser);
router.put('/users/:id', auth, checkRole(['admin']), adminController.updateUser);
router.delete('/users/:id', auth, checkRole(['admin']), adminController.deleteUser);

module.exports = router;
