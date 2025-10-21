const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Import routes
const patientsRouter = require('./routes/patients');
const therapistsRouter = require('./routes/therapists');
const appointmentsRouter = require('./routes/appointments');
const availabilityRouter = require('./routes/availability');
const sessionsRouter = require('./routes/sessions');
const medicalRecordsRouter = require('./routes/medicalRecords');
const messagesRouter = require('./routes/messages');
const reviewsRouter = require('./routes/reviews');
const treatmentPlansRouter = require('./routes/treatmentPlans');

const app = express();
const port = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(config.mongoURI, {
  writeConcern: {
    w: 'majority',
    wtimeout: 1000
  }
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindLoo API',
      version: '1.0.0',
      description: 'API za upravljanje pacijentima, terapeutima i terminima',
      contact: {
        name: 'MindLoo Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Patients',
        description: 'Patient management operations',
      },
      {
        name: 'Therapists',
        description: 'Therapist management operations',
      },
      {
        name: 'Appointments',
        description: 'Appointment scheduling and management',
      },
      {
        name: 'Availability',
        description: 'Therapist availability management',
      },
      {
        name: 'Sessions',
        description: 'Therapy session notes and tracking',
      },
      {
        name: 'Medical Records',
        description: 'Patient medical history and records',
      },
      {
        name: 'Messages',
        description: 'Communication between patients and therapists',
      },
      {
        name: 'Reviews',
        description: 'Therapist reviews and ratings',
      },
      {
        name: 'Treatment Plans',
        description: 'Patient treatment plans and goals',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MindLoo API Documentation',
}));

// Root route - redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/therapists', therapistsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/therapists', availabilityRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/treatment-plans', treatmentPlansRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Serve OpenAPI YAML file
app.get('/api/openapi.yaml', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger.yaml');
  res.sendFile(swaggerPath);
});

// Serve OpenAPI as JSON
app.get('/api/openapi.json', (req, res) => {
  try {
    const swaggerPath = path.join(__dirname, 'swagger.yaml');
    const swaggerYaml = fs.readFileSync(swaggerPath, 'utf8');
    const swaggerJson = yaml.load(swaggerYaml);
    res.json(swaggerJson);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load OpenAPI specification' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  console.log(`💚 Health check available at http://localhost:${port}/health`);
});

module.exports = app;

