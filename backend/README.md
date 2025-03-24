# Health Prediction System - Backend

## Database Setup

### Initial Setup

1. Make sure MongoDB is installed and running on your system
2. Copy `.env.example` to `.env` and configure your MongoDB connection
3. Run `npm install` to install dependencies
4. Run `npm run db:init` to initialize the database with required collections and test data

### Database Commands

The following npm scripts are available for database management:

- `npm run db:init` - Initialize database with required collections and test data
- `npm run db:test` - Test database connection
- `npm run db:list` - List all collections and document counts
- `npm run db:backup <collection>` - Backup a collection to JSON file
- `npm run db:clear <collection>` - Clear all documents from a collection

### Test Users

The database initialization creates the following test users:

- Admin: admin@example.com / admin123
- Doctor: doctor@example.com / doctor123
- Patient: patient@example.com / patient123

### MongoDB Structure

The system uses the following collections:

- **users** - All system users (patients, doctors, admins)
- **patients** - Patient profiles linked to user accounts
- **doctors** - Doctor profiles linked to user accounts
- **predictions** - Health prediction results
- **modelVersions** - Prediction model versions
- **appointments** - Patient-doctor appointments
- **tests** - Medical tests

## Running the Server

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
