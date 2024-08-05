const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, companyController.addCompany);
router.get('/', authenticate, companyController.getCompanies);
router.get('/:id', authenticate, companyController.getCompanyById);
router.put('/:id', authenticate, companyController.updateCompany);
router.delete('/:id', authenticate, companyController.deleteCompany);

module.exports = router;