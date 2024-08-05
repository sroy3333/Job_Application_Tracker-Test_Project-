const Company = require('../models/Company');
const JobListing = require('../models/JobListing');


exports.addCompany = async (req, res) => {
    try {
      const { name, contact, size, industry, notes, jobListings } = req.body;
      const company = await Company.create({ name, contact, size, industry, notes });
      
      if (jobListings && jobListings.length) {
        const jobListingInstances = jobListings.map(title => ({ title, companyId: company.id }));
        await JobListing.bulkCreate(jobListingInstances);
      }
      
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add company' });
    }
  };
  
  exports.getCompanies = async (req, res) => {
    try {
      const companies = await Company.findAll({ include: JobListing });
      res.status(200).json(companies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  };
  
  exports.getCompanyById = async (req, res) => {
    try {
      const company = await Company.findByPk(req.params.id, { include: JobListing });
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  };
  
  exports.updateCompany = async (req, res) => {
    try {
      const { name, contact, size, industry, notes, jobListings } = req.body;
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      await company.update({ name, contact, size, industry, notes });
      
      if (jobListings) {
        await JobListing.destroy({ where: { companyId: company.id } });
        const jobListingInstances = jobListings.map(title => ({ title, companyId: company.id }));
        await JobListing.bulkCreate(jobListingInstances);
      }
      
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update company' });
    }
  };
  
  exports.deleteCompany = async (req, res) => {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      await JobListing.destroy({ where: { companyId: company.id } });
      await company.destroy();
      
      res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete company' });
    }
  };