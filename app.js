const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const applicationRoutes = require('./routes/application');
const companyRoutes = require('./routes/company');
const profileRoutes = require('./routes/profile');
const sequelize = require('./util/database');
const cors = require('cors');


const User = require('./models/User');
const Application = require('./models/Application');
const Attachment = require('./models/Attachment');
const Company = require('./models/Company');
const JobListing = require('./models/JobListing');
const Profile = require('./models/Profile');
const Reminder = require('./models/Reminder');

dotenv.config()

const app = express();

app.set('view engine', 'html')
app.set('views', 'views');

app.use(cors({
    origin: "*",
    credentials: true,
}));

app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/applications', applicationRoutes);
app.use('/companies', companyRoutes);
app.use('/profile', profileRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register', 'register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});


app.get('/Dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Dashboard.html'));
});

app.get('/Applications.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Applications.html'));
});

app.get('/Logout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Logout.html'));
});

app.get('/Companies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Companies.html'));
});

app.get('/Profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Profile.html'));
});



User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

Application.hasMany(Attachment, { foreignKey: 'applicationId' });
Attachment.belongsTo(Application, { foreignKey: 'applicationId' });

Company.hasMany(JobListing, { foreignKey: 'companyId' });
JobListing.belongsTo(Company, { foreignKey: 'companyId' });

User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

Application.hasMany(Reminder, { foreignKey: 'applicationId' });
Reminder.belongsTo(Application, { foreignKey: 'applicationId' });

sequelize.sync({force: true})
    .then(result => {
        app.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT || 7000}`);
        });
    })
    .catch(err => {
        console.log(err);
    });