# MindLoo API

RESTful API for managing patients, therapists, and appointments.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

1. **Create a `.env` file** in the root directory:

```bash
cp .env.example .env
```

2. **Update the `.env` file** with your MongoDB connection string:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**⚠️ Important:** Never commit your `.env` file to Git. It's already included in `.gitignore`.

### Running the Application

**Production mode:**
```bash
npm start
```

**Development mode (with auto-reload):**
```bash
npm run dev
```

Server will run on **http://localhost:3000**

## 📚 API Documentation

### Interactive Documentation

Once the server is running, interactive Swagger UI documentation is available at:

**http://localhost:3000/api-docs**

This provides a complete interactive interface where you can test all API endpoints directly from your browser.

### OpenAPI Specification

The complete OpenAPI 3.0 specification is available in multiple formats:

**Local Files:**
- `swagger.yaml` - OpenAPI specification in YAML format

**API Endpoints (when server is running):**
- **YAML:** http://localhost:3000/api/openapi.yaml
- **JSON:** http://localhost:3000/api/openapi.json

**Usage:**

1. **Import into Postman**
   - File → Import → Choose `swagger.yaml` or paste URL
   - All endpoints will be automatically created with proper schemas

2. **Import into Insomnia**
   - Application → Preferences → Data → Import Data
   - Select `swagger.yaml` file

3. **Code Generation**
   - Use OpenAPI Generator to generate client SDKs
   - Supports 50+ programming languages
   ```bash
   openapi-generator-cli generate -i swagger.yaml -g javascript -o ./client
   ```

4. **API Documentation**
   - The YAML file serves as API contract documentation
   - Can be version controlled and shared with team

## 🏗️ Project Structure

```
MindLooApp/
├── models/                         # Mongoose schemas
│   ├── Patient.js                  # Patient data model
│   ├── Therapist.js                # Therapist data model
│   ├── Appointment.js              # Appointment model
│   ├── TherapistAvailability.js    # Therapist working hours
│   ├── TherapistUnavailability.js  # Booked time slots
│   ├── Session.js                  # Therapy session notes
│   ├── MedicalRecord.js            # Patient medical records
│   ├── Message.js                  # Communication messages
│   ├── Review.js                   # Therapist reviews
│   └── TreatmentPlan.js            # Treatment plans & goals
├── routes/                         # API routes
│   ├── patients.js                 # Patient endpoints
│   ├── therapists.js               # Therapist endpoints
│   ├── appointments.js             # Appointment endpoints
│   ├── availability.js             # Availability endpoints
│   ├── sessions.js                 # Session endpoints
│   ├── medicalRecords.js           # Medical record endpoints
│   ├── messages.js                 # Messaging endpoints
│   ├── reviews.js                  # Review endpoints
│   └── treatmentPlans.js           # Treatment plan endpoints
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
├── config.js                       # MongoDB configuration
├── server.js                       # Main server file
├── swagger.yaml                    # OpenAPI 3.0 specification
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔌 API Endpoints

### Core Modules

### 👥 Patients (`/api/patients`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/patients` | Create a new patient |
| `GET` | `/api/patients` | Get all patients |
| `GET` | `/api/patients/:id` | Get patient by ID or email |
| `PATCH` | `/api/patients/:id` | Update patient information |
| `DELETE` | `/api/patients/:id` | Delete a patient |

### 👨‍⚕️ Therapists (`/api/therapists`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/therapists` | Create a new therapist |
| `GET` | `/api/therapists` | Get all therapists |
| `GET` | `/api/therapists/:id` | Get therapist by ID or email |
| `PATCH` | `/api/therapists/:id` | Update therapist information |
| `DELETE` | `/api/therapists/:id` | Delete a therapist |

### 📅 Appointments (`/api/appointments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/appointments` | Create a new appointment |
| `GET` | `/api/appointments` | Get appointments (with filters) |
| `GET` | `/api/appointments/:id` | Get appointment by ID |
| `PATCH` | `/api/appointments/:id` | Update appointment |
| `DELETE` | `/api/appointments/:id` | Delete an appointment |

**Query parameters for GET `/api/appointments`:**
- `therapistId` - Filter by therapist ID
- `patientId` - Filter by patient ID
- `date` - Filter by date
- `status` - Filter by status (scheduled, completed, cancelled, rescheduled)

### 🕐 Therapist Availability

#### Working Hours (availability)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/therapists/:therapistId/availability` | Get therapist working hours |
| `POST` | `/api/therapists/:therapistId/availability` | Add working hours |
| `DELETE` | `/api/therapists/:therapistId/availability` | Delete working hours |

#### Unavailability (booked slots)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/therapists/:therapistId/unavailability` | Get booked time slots |
| `POST` | `/api/therapists/:therapistId/unavailability` | Add unavailable slots |
| `DELETE` | `/api/therapists/:therapistId/unavailability` | Delete unavailable slots |

### 📝 Sessions (`/api/sessions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sessions` | Create a new therapy session record |
| `GET` | `/api/sessions` | Get sessions (with filters) |
| `GET` | `/api/sessions/:id` | Get session by ID |
| `PATCH` | `/api/sessions/:id` | Update session information |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `GET` | `/api/sessions/patient/:patientId/progress` | Get patient progress over time |

**Query parameters for GET `/api/sessions`:**
- `therapistId` - Filter by therapist ID
- `patientId` - Filter by patient ID
- `appointmentId` - Filter by appointment ID
- `sessionType` - Filter by type (initial, follow-up, emergency, final)
- `isCompleted` - Filter by completion status

### 🏥 Medical Records (`/api/medical-records`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/medical-records` | Create a new medical record |
| `GET` | `/api/medical-records/patient/:patientId` | Get all records for a patient |
| `GET` | `/api/medical-records/:id` | Get record by ID |
| `PATCH` | `/api/medical-records/:id` | Update medical record |
| `DELETE` | `/api/medical-records/:id` | Delete a medical record |
| `GET` | `/api/medical-records/patient/:patientId/summary` | Get medical summary |

**Record Types:**
- `diagnosis` - Medical diagnoses
- `medication` - Medication history
- `allergy` - Patient allergies
- `lab-result` - Laboratory test results
- `history` - Medical history
- `other` - Other records

### 💬 Messages (`/api/messages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/messages` | Send a new message |
| `GET` | `/api/messages/conversation/:conversationId` | Get all messages in a conversation |
| `GET` | `/api/messages/user/:userId` | Get all conversations for a user |
| `GET` | `/api/messages/:id` | Get message by ID |
| `PATCH` | `/api/messages/:id/read` | Mark message as read |
| `DELETE` | `/api/messages/:id` | Delete a message |

**Message Types:**
- `text` - Regular text message
- `appointment-request` - Appointment request
- `prescription` - Prescription related
- `document` - Document attachment
- `emergency` - Emergency message

### ⭐ Reviews (`/api/reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reviews` | Create a new review |
| `GET` | `/api/reviews/therapist/:therapistId` | Get all reviews for a therapist |
| `GET` | `/api/reviews/therapist/:therapistId/stats` | Get review statistics |
| `GET` | `/api/reviews/patient/:patientId` | Get all reviews by a patient |
| `GET` | `/api/reviews/:id` | Get review by ID |
| `PATCH` | `/api/reviews/:id` | Update review |
| `PATCH` | `/api/reviews/:id/respond` | Add therapist response to review |
| `DELETE` | `/api/reviews/:id` | Delete a review |

**Rating Categories:**
- `professionalism` - Professional conduct
- `communication` - Communication skills
- `effectiveness` - Treatment effectiveness
- `empathy` - Empathy and understanding

### 📋 Treatment Plans (`/api/treatment-plans`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/treatment-plans` | Create a new treatment plan |
| `GET` | `/api/treatment-plans/patient/:patientId` | Get all plans for a patient |
| `GET` | `/api/treatment-plans/therapist/:therapistId` | Get all plans by a therapist |
| `GET` | `/api/treatment-plans/:id` | Get treatment plan by ID |
| `PATCH` | `/api/treatment-plans/:id` | Update treatment plan |
| `PATCH` | `/api/treatment-plans/:id/goals/:goalId` | Update specific goal |
| `POST` | `/api/treatment-plans/:id/milestones` | Add milestone to plan |
| `DELETE` | `/api/treatment-plans/:id` | Delete a treatment plan |
| `GET` | `/api/treatment-plans/patient/:patientId/progress` | Get overall progress |

**Plan Status:**
- `active` - Currently active
- `completed` - Successfully completed
- `on-hold` - Temporarily paused
- `cancelled` - Cancelled

### ❤️ Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check server and database status |

## 📝 API Usage Examples

### Create a Patient

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profile": {
      "age": 30,
      "gender": "male"
    },
    "contactInfo": {
      "phone": "+1234567890",
      "address": "123 Main St",
      "place": "New York",
      "country": "USA"
    }
  }'
```

### Create a Therapist

```bash
curl -X POST http://localhost:3000/api/therapists \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "T001",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@mindloo.com",
    "profile": {
      "age": 35,
      "gender": "female",
      "specialization": "Cognitive Behavioral Therapy",
      "experience": 10
    },
    "contactInfo": {
      "phone": "+1987654321",
      "address": "456 Oak Ave",
      "place": "Los Angeles",
      "country": "USA"
    }
  }'
```

### Add Therapist Working Hours

```bash
curl -X POST http://localhost:3000/api/therapists/T001/availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-25",
    "time_slots": [
      {
        "start": "09:00",
        "end": "12:00"
      },
      {
        "start": "14:00",
        "end": "17:00"
      }
    ]
  }'
```

### Create an Appointment

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "T001",
    "patientId": "P001",
    "date": "2025-10-25",
    "timeSlot": {
      "start": "10:00",
      "end": "11:00"
    },
    "status": "scheduled",
    "subject": "Initial consultation",
    "notes": "First session with patient"
  }'
```

### Get All Appointments for a Therapist

```bash
curl http://localhost:3000/api/appointments?therapistId=T001
```

### Get All Appointments for a Specific Date

```bash
curl http://localhost:3000/api/appointments?date=2025-10-25
```

### Update Appointment Status

```bash
curl -X PATCH http://localhost:3000/api/appointments/{appointmentId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Session completed successfully"
  }'
```

### Delete an Appointment

```bash
curl -X DELETE http://localhost:3000/api/appointments/{appointmentId}
```

### Create a Therapy Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "abc123",
    "therapistId": "T001",
    "patientId": "P001",
    "sessionDate": "2025-10-25T10:00:00Z",
    "duration": 60,
    "sessionType": "follow-up",
    "notes": {
      "symptoms": "Patient reports improved mood",
      "observations": "More engaged in conversation",
      "interventions": "Continued CBT techniques",
      "homework": "Daily mood journal"
    },
    "mood": {
      "before": 4,
      "after": 7
    }
  }'
```

### Add Medical Record

```bash
curl -X POST http://localhost:3000/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "recordType": "diagnosis",
    "title": "Generalized Anxiety Disorder",
    "diagnosis": {
      "code": "F41.1",
      "name": "Generalized Anxiety Disorder",
      "severity": "moderate"
    },
    "addedBy": "T001"
  }'
```

### Send a Message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "P001",
    "senderType": "patient",
    "receiverId": "T001",
    "receiverType": "therapist",
    "subject": "Question about next session",
    "content": "Can we reschedule our next appointment?",
    "priority": "normal"
  }'
```

### Create a Review

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "T001",
    "patientId": "P001",
    "rating": 5,
    "categories": {
      "professionalism": 5,
      "communication": 5,
      "effectiveness": 4,
      "empathy": 5
    },
    "comment": "Excellent therapist, very helpful and understanding."
  }'
```

### Create a Treatment Plan

```bash
curl -X POST http://localhost:3000/api/treatment-plans \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "therapistId": "T001",
    "title": "Anxiety Management Plan",
    "description": "6-month treatment plan focusing on CBT",
    "goals": [
      {
        "description": "Reduce anxiety symptoms by 50%",
        "targetDate": "2026-04-25",
        "status": "not-started",
        "progress": 0
      }
    ],
    "startDate": "2025-10-25",
    "status": "active"
  }'
```

## 🔧 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Swagger UI** - API documentation
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

## 🎯 Key Features

### Core Features
✅ **RESTful API Design** - Standard HTTP methods (GET, POST, PATCH, DELETE)  
✅ **Consistent URI Structure** - Logical hierarchy and resource-based naming  
✅ **Swagger Documentation** - Interactive API documentation  
✅ **Organized Structure** - Clear separation of models and routes  
✅ **Optimized Models** - Shared models with validation  
✅ **Error Handling** - Centralized error management  
✅ **Environment Variables** - Secure credential management with dotenv  
✅ **Query Filtering** - Flexible filtering across all resources  

### Patient Management
✅ **Patient Profiles** - Complete patient information management  
✅ **Medical Records** - Comprehensive medical history tracking  
✅ **Treatment Plans** - Goal-based treatment planning and tracking  
✅ **Session Notes** - Detailed therapy session documentation  
✅ **Progress Tracking** - Mood and progress analytics  

### Therapist Management
✅ **Therapist Profiles** - Specialization and experience tracking  
✅ **Availability Management** - Working hours and time slot management  
✅ **Review System** - Patient reviews and ratings with categories  
✅ **Session Management** - Track all therapy sessions  

### Communication
✅ **Messaging System** - Secure patient-therapist communication  
✅ **Priority Messages** - Message prioritization (normal, high, urgent)  
✅ **Conversation Threading** - Organized message threads  
✅ **Read Receipts** - Message read tracking  

### Appointments & Scheduling
✅ **Appointment Booking** - Smart appointment scheduling  
✅ **Availability Checking** - Real-time availability verification  
✅ **Conflict Prevention** - Automatic double-booking prevention  
✅ **Multiple Filters** - Filter by date, therapist, patient, status  

### Analytics & Reporting
✅ **Patient Progress** - Track patient improvement over time  
✅ **Treatment Goals** - Goal achievement tracking  
✅ **Review Statistics** - Therapist rating analytics  
✅ **Medical Summaries** - Comprehensive patient medical summaries  

## 🔐 HTTP Status Codes

- `200` - OK (success)
- `201` - Created (resource created successfully)
- `400` - Bad Request (invalid request)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error (server error)

## 💡 Tips

1. **Use Swagger UI** for the easiest way to explore and test the API: http://localhost:3000/api-docs
2. **Postman/Insomnia** - You can import these examples into Postman or Insomnia
3. **Thunder Client** - VS Code extension for testing APIs
4. **curl** - Use curl commands from the terminal for quick tests

## 🐛 Troubleshooting

### Server won't start?

```bash
# Check if port 3000 is available
lsof -i :3000

# Kill the process if port is in use
kill -9 <PID>
```

### MongoDB connection error?

- Check `config.js` for correct MongoDB URI
- Verify internet connection
- Ensure MongoDB Atlas whitelist includes your IP address

### Need to reinstall dependencies?

```bash
npm install
```

## 📊 Complete Test Scenario

Here's a complete workflow example:

```bash
# 1. Create a therapist
curl -X POST http://localhost:3000/api/therapists \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "T001",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@mindloo.com",
    "profile": {"specialization": "CBT"}
  }'

# 2. Add therapist working hours
curl -X POST http://localhost:3000/api/therapists/T001/availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-25",
    "time_slots": [{"start": "09:00", "end": "17:00"}]
  }'

# 3. Create a patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'

# 4. Create an appointment
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "T001",
    "patientId": "P001",
    "date": "2025-10-25",
    "timeSlot": {"start": "10:00", "end": "11:00"},
    "subject": "First session"
  }'

# 5. Check all appointments
curl http://localhost:3000/api/appointments?therapistId=T001
```

## 🚀 Quick Start

1. **Install dependencies:** `npm install`
2. **Setup environment variables:** 
   ```bash
   cp .env.example .env
   # Edit .env and add your MongoDB connection string
   ```
3. **Start server:** `npm start` or `npm run dev`
4. **Open Swagger UI:** http://localhost:3000/api-docs
5. **Start testing!**

## 🔒 Environment Variables

The application uses environment variables for sensitive configuration. These are stored in a `.env` file which should **never be committed to Git**.

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mindloo` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |

**Setup:**
1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` with your actual MongoDB connection string
3. The `.env` file is already in `.gitignore` and won't be committed

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use `.env.example`** - Commit this template file for team members
3. **Rotate credentials** - If accidentally committed, change passwords immediately
4. **MongoDB Atlas IP Whitelist** - Restrict access to specific IP addresses
5. **Use strong passwords** - For database users

### If you accidentally committed `.env`:

```bash
# Remove from git history
git rm --cached .env
git commit -m "Remove .env from repository"

# Then change your MongoDB password immediately!
```

## 📄 License

MindLoo © 2025

---

## 🔄 Version History

### Version 2.0.0 (Current)

- Consolidated server architecture
- RESTful API design with standard HTTP methods
- Swagger/OpenAPI documentation
- Organized project structure with models and routes
- Enhanced error handling
- Query parameter filtering

### Version 1.0.0 (Previous)

- 13 separate servers on different ports
- Basic CRUD operations
- No centralized documentation

---

**Made with ❤️ by the Stefan Ramač**
Linkedin profile: https://www.linkedin.com/in/stefanramac
