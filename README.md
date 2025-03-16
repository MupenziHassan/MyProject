# Health Prediction System

A comprehensive web application for cancer risk prediction and patient management with ML integration.

## Overview

The Health Prediction System is a healthcare platform that leverages machine learning to predict cancer risk, manage patient data, and facilitate communication between patients and healthcare providers. The system was inspired by the healthcare innovations at Ubumuntu Clinic in Rwanda.

## Features

### For Patients
- Cancer risk assessment and visualization
- Appointment scheduling with doctors
- Health vitals tracking
- Medical test results access
- Secure messaging with healthcare providers

### For Doctors
- Patient management dashboard
- Cancer risk prediction analysis
- Appointment calendar and management
- Test ordering and result review
- Telemedicine/video consultation

### For Administrators
- User management
- Doctor verification
- System analytics
- ML model performance monitoring
- Notification template management

## Technology Stack

- **Frontend**: React, Chart.js, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **ML Integration**: RESTful API to machine learning service

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/MupenziHassan/MyProject.git
   cd Health-prediction-system
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Configure environment variables:
   - Create `.env` files in both `backend` and `frontend` directories using the provided templates

4. Set up the database:
   ```
   cd backend
   node src/setupTestUsers.js
   ```

5. Start the application:
   ```
   cd ..
   npm start
   ```

## Usage

### Accessing the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:8080/api/v1

### Default User Accounts

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | admin@example.com   | admin123   |
| Doctor  | doctor@example.com  | doctor123  |
| Patient | patient@example.com | patient123 |

## System Architecture

The Health Prediction System follows a modern client-server architecture:
- **Frontend**: React-based SPA with component-based UI
- **Backend**: RESTful API with Express
- **Database**: MongoDB for flexible document storage
- **Authentication**: JWT-based stateless authentication
- **ML Service**: Dedicated microservice for predictive modeling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ubumuntu Clinic for inspiration and healthcare domain expertise
- All contributors who have participated in this project
