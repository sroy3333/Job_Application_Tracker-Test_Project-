const { Op } = require('sequelize');
const Application = require('../models/Application');
const Reminder = require('../models/Reminder');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userid;

        const totalApplications = await Application.count({ where: { userId } });
        const totalInterviews = await Application.count({ where: { userId, status: 'interviewed' } });
        const offersReceived = await Application.count({ where: { userId, status: 'Offered' } });
        const applicationsProgress = await Application.findAll({ where: { userId } });
        const upcomingReminders = await Reminder.findAll({ 
            where: { userId, reminderDate: { [Op.gte]: new Date() } },
            include: [{ model: Application, attributes: ['companyName'] }] 
        });

        res.status(200).json({
            totalApplications,
            totalInterviews,
            offersReceived,
            applicationsProgress,
            upcomingReminders,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};