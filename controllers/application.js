const { Op, } = require('sequelize');
const Reminder = require('../models/Reminder');
const Application = require('../models/Application');
const User = require('../models/User');
const Attachment = require('../models/Attachment');
const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const brevoApiKey = process.env.BREVO_API_KEY;
const apiInstance = new TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = brevoApiKey;

exports.setReminder = async (req, res) => {
  const { companyName, reminderDate } = req.body;

  try {
    const application = await Application.findOne({ where: { companyName } });
    if(!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const user = await User.findByPk(application.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const reminder = await Reminder.create({
      applicationId: application.id,
      reminderDate,
      isNotified: false, // Initialize as false
      userId: application.userId
    });

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.sender = { name: 'Sukanya Roy', email: 'sukanyaindia2222@gmail.com' };
    sendSmtpEmail.subject = 'Follow-Up Reminder';
    sendSmtpEmail.htmlContent = `
      <p>Dear ${user.name},</p>
      <p>This is a reminder to follow up on your application at ${application.companyName} for the position of ${application.jobTitle}.</p>
      <p>Best regards,</p>
      <p>Your Job Application Tracker</p>
    `;

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      reminder.isNotified = true; // Mark as notified
      await reminder.save(); // Save the change to the database
      console.log('Email sent successfully:', reminder);
      res.status(201).json(reminder);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};


exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      include: [{ model: Application }]
    });

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Error fetching reminders' });
  }
};

exports.markReminderAsNotified = async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await Reminder.findByPk(id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminder.isNotified = true;
    await reminder.save();

    res.status(200).json(reminder);
  } catch (error) {
    console.error('Error marking reminder as notified:', error);
    res.status(500).json({ error: 'Error marking reminder as notified' });
  }
};

// Create a new job application
exports.createApplication = async (req, res) => {
  const { companyName, jobTitle, applicationDate, status, notes } = req.body;
  const userId = req.user.userid;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };


  try {
    const newApplication = await Application.create({
      companyName,
      jobTitle,
      applicationDate,
      status,
      userId,
      notes,
    });

    const data = await s3.upload(uploadParams).promise();
    await Attachment.create({
      fileUrl: data.Location, // file.location contains the S3 URL
      fileName: file.originalname,
      applicationId: newApplication.id,
    });
    const applicationWithAttachment = await Application.findByPk(newApplication.id, {
      include: [{ model: Attachment }]
    });
    res.status(201).json(applicationWithAttachment);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Error creating application' });
  }    
};
  
// Get all applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [Attachment],
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Error fetching applications' });
  }
};

exports.getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await Application.findByPk(id, {
      include: [Attachment]
    });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Error fetching application' });
  }
};

exports.updateApplication = async (req, res) => {
  const { id } = req.params;
  const { companyName, jobTitle, applicationDate, status, notes } = req.body;
  const file = req.file;

  try {
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.companyName = companyName;
    application.jobTitle = jobTitle;
    application.applicationDate = applicationDate;
    application.status = status;
    application.notes = notes;

    if (file) {
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };
      const data = await s3.upload(uploadParams).promise();
      await Attachment.create({
        fileUrl: data.Location,
        fileName: file.originalname,
        applicationId: application.id,
      });
    }

    await application.save();
    const updatedApplication = await Application.findByPk(id, {
      include: [Attachment]
    });
    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Error updating application' });
  }
};

exports.deleteApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await Attachment.update({ applicationId: null }, { where: { applicationId: id } });
    await Reminder.destroy({ where: { applicationId: id} });

    await application.destroy();
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Error deleting application' });
  }
};
  
// Search applications
exports.searchApplications = async (req, res) => {
  const { keyword } = req.query;

  try {
    const applications = await Application.findAll({
      where: {
        [Op.or]: [
          { companyName: { [Op.like]: `%${keyword}%` } },
          { jobTitle: { [Op.like]: `%${keyword}%` } },
        ],
      },
      include: [Attachment],
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error searching applications:', error);
    res.status(500).json({ error: 'Error searching applications' });
  }
};

  
// Filter applications
exports.filterApplications = async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const where = {};
  
  if (status) where.status = status;
  if (startDate) where.applicationDate = { [Op.gte]: new Date(startDate) };
  if (endDate) where.applicationDate = { [Op.lte]: new Date(endDate) };
  
  try {
    const applications = await Application.findAll({
      where,
      include: [Attachment],
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error filtering applications:', error);
    res.status(500).json({ error: 'Error filtering applications' });
  }
};

exports.getApplicationStatusCounts = async (req, res) => {
  try {
    const applicationStatusCounts = await Application.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json(applicationStatusCounts);
  } catch (error) {
    console.error('Error fetching application status counts:', error);
    res.status(500).json({ error: 'Error fetching application status counts' });
  }
};