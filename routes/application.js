const express = require('express');
const applicationController = require('../controllers/application');
const authenticate = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const upload = multer();


router.post('/', authenticate, upload.single('attachment'), applicationController.createApplication);
router.get('/', authenticate, applicationController.getApplications);
router.post('/reminders', authenticate, applicationController.setReminder);
router.get('/reminders', authenticate, applicationController.getReminders);
router.get('/search', authenticate, applicationController.searchApplications);
router.get('/filter', authenticate, applicationController.filterApplications);
router.get('/status-counts', authenticate, applicationController.getApplicationStatusCounts);
router.patch('/reminders/:id/notified', authenticate, applicationController.markReminderAsNotified);
router.get('/:id', authenticate, applicationController.getApplicationById);
router.put('/:id', authenticate, upload.single('attachment'), applicationController.updateApplication);
router.delete('/:id', authenticate, applicationController.deleteApplication);

module.exports = router;