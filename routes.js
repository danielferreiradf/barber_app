const { Router } = require('express');
const multer = require('multer');
const multerConfig = require('./config/multer');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');
const ProviderController = require('./app/controllers/ProviderController');
const AppointmentController = require('./app/controllers/AppointmentController');
const ScheduleController = require('./app/controllers/ScheduleController');
const NotificationController = require('./app/controllers/NotificationController');
const AvailableController = require('./app/controllers/AvailableController');

// Middlewares
const authMiddleware = require('./app/middlewares/auth');

const routes = new Router();
const upload = multer(multerConfig);

// Users
routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);
routes.get('/users', authMiddleware, UserController.getCurrent);

// Sessions
routes.post('/sessions', SessionController.create);

// Providers
routes.get('/providers', authMiddleware, ProviderController.getAll);
routes.get(
  '/providers/:provider_id/available',
  authMiddleware,
  AvailableController.get
);

// Appointments
routes.post('/appointments', authMiddleware, AppointmentController.create);
routes.get('/appointments', authMiddleware, AppointmentController.getAll);
routes.delete(
  '/appointments/:appointment_id',
  authMiddleware,
  AppointmentController.delete
);

// Schedule
routes.get('/schedule', authMiddleware, ScheduleController.getAll);

// Notifications
routes.get('/notifications', authMiddleware, NotificationController.getAll);
routes.put(
  '/notifications/:notification_id',
  authMiddleware,
  NotificationController.update
);

// Uploads
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);

module.exports = routes;
