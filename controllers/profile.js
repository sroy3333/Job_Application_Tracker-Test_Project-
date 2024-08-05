const Profile = require('../models/Profile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getProfile = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const profile = await Profile.findOne({ where: { userId: decoded.userid } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, contact, address, careerGoals, email } = req.body;

    try {
        const token = req.headers['authorization'];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        const profile = await Profile.findOne({ where: { userId: decoded.userid } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update the profile fields
        profile.name = name || profile.name;
        profile.contact = contact || profile.contact;
        profile.address = address || profile.address;
        profile.careerGoals = careerGoals || profile.careerGoals;

        // Check if the email is being updated
        if (email && email !== profile.email) {
            // Update email in Profile and User
            profile.email = email;

            const user = await User.findOne({ where: { id: decoded.userid } });
            if (user) {
                user.email = email;
                await user.save();
            }
        }

        await profile.save();

        res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};