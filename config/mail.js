require('dotenv').config({ path: './config/config.env' });

module.exports = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'BarberApp <noreply@barberapp.com>',
  },
};
