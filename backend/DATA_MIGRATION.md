# Data Migration Guide

This guide explains how to use the data migration tools in the Health Prediction System to populate the MongoDB database with initial data and migrate existing mock data.

## Prerequisites

1. MongoDB should be installed and running
2. Node.js and npm should be installed
3. Backend dependencies should be installed (`npm install`)
4. `.env` file should be configured with the correct `MONGO_URI`

## Available Tools

The following npm scripts are available for data migration:

- `npm run db:seed` - Seed database with initial user data
- `npm run db:import-records` - Import medical records from a JSON file
- `npm run db:migrate-mock` - Migrate mock data from a directory to MongoDB
- `npm run db:list` - List all collections and document counts
- `npm run db:backup <collection>` - Backup a collection to JSON
- `npm run db:clear <collection>` - Clear all documents from a collection
- `npm run db:manager` - Interactive data management tool

## Data Migration Process

### Step 1: Seed Initial User Data

The system comes with predefined test users (admins, doctors, patients) that you can seed into the database:

```bash
npm run db:seed
```

This will create several test users with different roles (admin, doctor, patient) and their respective profiles.

### Step 2: Import Medical Records

To import sample medical records from a JSON file:

```bash
npm run db:import-records data/sampleMedicalRecords.json
```

You can also validate the records without importing them:

```bash
npm run db:import-records data/sampleMedicalRecords.json --validate
```

### Step 3: Migrate Mock Data (optional)

If you have existing mock data in JSON format, you can migrate it to MongoDB:

```bash
npm run db:migrate-mock data/mock
```

This command expects a directory structure with JSON files named after the collections they should be imported into (e.g., `users.json`, `medicalRecords.json`, etc.).

## Using the Data Manager

The Data Manager provides an interactive interface for managing your database:

```bash
npm run db:manager
```

This tool allows you to:
- Seed users
- Import medical records
- Migrate mock data
- List collections
- Export collections to JSON
- Validate JSON files against models

## Data Validation

All imported data is validated against the Mongoose schemas before insertion. This ensures data integrity and prevents invalid data from being inserted into the database.

You can validate an existing JSON file without importing it:

```bash
npm run db:manager
# Then select option 6: Validate JSON file against model
```

## Data Structure

When preparing JSON files for import, ensure they follow the schema structure for each model. The expected structures for the main collections are:

### Users
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "patient"
}
```

### Medical Records
```json
{
  "patientEmail": "patient@example.com",
  "doctorEmail": "doctor@example.com",
  "visitDate": "2023-08-15T10:30:00Z",
  "recordType": "general_checkup",
  "chiefComplaint": "Annual physical examination",
  "diagnosis": [
    {
      "name": "Hypertension",
      "icd10Code": "I10"
    }
  ]
}
```

Emails in the Medical Records are automatically converted to ObjectIDs during import.

## Troubleshooting

- If you encounter MongoDB connection errors, ensure MongoDB is running and your connection string in `.env` is correct
- If import fails due to validation errors, check the error messages for details on which fields are invalid
- For duplicate key errors, the item likely already exists in the database

## Backup and Restore

To backup a collection:

```bash
npm run db:backup users
```

This will create a JSON file in the `backups` directory.

To restore from a backup, use the data manager's import functionality.

## Additional Data Management Commands

The following commands provide additional functionality for data management:

### Create Sample Data

Create comprehensive sample data across all collections:

```bash
npm run db:sample-data
```

To clear existing data before creating samples:

```bash
npm run db:sample-data -- --clear
```

### Export Data to CSV

Export a collection to CSV format for analysis:

```bash
npm run db:export-csv users [output-path.csv]
```

### Backup Entire Database

Backup all collections in the database:

```bash
npm run db:backup-all
```

Specify collections to backup:

```bash
npm run db:backup-all -- --collections users,patients
```

Set a custom output directory:

```bash
npm run db:backup-all -- --output /path/to/backup/dir
```

## Data Migration Best Practices

1. **Always backup** your data before performing migrations
2. **Validate data** before importing into production databases
3. Use **staging environments** to test migrations before applying to production
4. For large datasets, consider using **incremental migrations** to avoid timeouts
5. Maintain **clear documentation** of all data changes for audit purposes

## Troubleshooting Common Migration Issues

### Connection Issues
- Ensure MongoDB is running
- Check your MongoDB URI in the `.env` file
- Verify network connectivity to the database server

### Validation Errors
- Check that data fields match the expected schema
- Ensure required fields are present
- Verify data types match the schema requirements

### Performance Issues
- For large collections, use pagination during import
- Increase MongoDB timeout settings
- Consider using the MongoDB bulk operations API for better performance

