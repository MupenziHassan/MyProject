const mongoose = require('mongoose');

/**
 * Validates data against a Mongoose schema
 * @param {Object} data - The data to validate
 * @param {mongoose.Schema} schema - The Mongoose schema to validate against
 * @returns {Object} - Validation result with isValid flag and any errors
 */
function validateData(data, schema) {
  const result = {
    isValid: true,
    errors: []
  };
  
  // Get all paths from the schema
  const schemaPaths = Object.keys(schema.paths);
  
  // Check required fields
  for (const path of schemaPaths) {
    const schemaType = schema.paths[path];
    
    // Skip MongoDB internal fields and virtual properties
    if (path === '_id' || path === '__v' || path === 'id' || schemaType.options.type === 'virtual') {
      continue;
    }
    
    // Check if the field is required
    if (schemaType.options.required) {
      // Handle nested paths (e.g., 'name.first')
      const pathParts = path.split('.');
      let value = data;
      
      for (const part of pathParts) {
        if (value === undefined || value === null) {
          break;
        }
        value = value[part];
      }
      
      if (value === undefined || value === null) {
        result.isValid = false;
        result.errors.push(`Required field missing: ${path}`);
      }
    }
  }
  
  // Check data types
  for (const field in data) {
    // Skip undefined or null values
    if (data[field] === undefined || data[field] === null) {
      continue;
    }
    
    // Check if field exists in schema
    if (!schema.paths[field] && !field.includes('.') && field !== '_id') {
      // This is a warning, not necessarily an error
      // result.errors.push(`Field not in schema: ${field}`);
      console.warn(`Field not in schema (will be ignored): ${field}`);
      continue;
    }
    
    const schemaType = schema.paths[field];
    if (!schemaType) continue; // Skip fields that might be nested
    
    // Check enum values
    if (schemaType.options.enum && !schemaType.options.enum.includes(data[field])) {
      result.isValid = false;
      result.errors.push(`Invalid enum value for ${field}: ${data[field]}. Must be one of: ${schemaType.options.enum.join(', ')}`);
    }
    
    // Check min/max for numbers
    if (schemaType.instance === 'Number') {
      if (schemaType.options.min !== undefined && data[field] < schemaType.options.min) {
        result.isValid = false;
        result.errors.push(`Value for ${field} is below minimum: ${data[field]} < ${schemaType.options.min}`);
      }
      
      if (schemaType.options.max !== undefined && data[field] > schemaType.options.max) {
        result.isValid = false;
        result.errors.push(`Value for ${field} is above maximum: ${data[field]} > ${schemaType.options.max}`);
      }
    }
    
    // Check string length
    if (schemaType.instance === 'String') {
      if (schemaType.options.minlength !== undefined && data[field].length < schemaType.options.minlength) {
        result.isValid = false;
        result.errors.push(`String length for ${field} is below minimum: ${data[field].length} < ${schemaType.options.minlength}`);
      }
      
      if (schemaType.options.maxlength !== undefined && data[field].length > schemaType.options.maxlength) {
        result.isValid = false;
        result.errors.push(`String length for ${field} is above maximum: ${data[field].length} > ${schemaType.options.maxlength}`);
      }
    }
    
    // Check regex patterns
    if (schemaType.instance === 'String' && schemaType.options.match && !schemaType.options.match[0].test(data[field])) {
      result.isValid = false;
      result.errors.push(`Value for ${field} doesn't match the required pattern: ${data[field]}`);
    }
  }
  
  return result;
}

/**
 * Check if a value is of the expected type based on a Mongoose SchemaType
 * @param {*} value - The value to check
 * @param {mongoose.SchemaType} schemaType - The Mongoose schema type
 * @returns {boolean} - Whether the value matches the expected type
 */
function isTypeValid(value, schemaType) {
  if (value === undefined || value === null) {
    return true; // Skip type checking for undefined or null values
  }
  
  switch (schemaType.instance) {
    case 'String':
      return typeof value === 'string';
      
    case 'Number':
      return typeof value === 'number' && !isNaN(value);
      
    case 'Boolean':
      return typeof value === 'boolean';
      
    case 'Date':
      return (
        value instanceof Date || 
        (typeof value === 'string' && !isNaN(Date.parse(value)))
      );
      
    case 'ObjectID':
      return (
        mongoose.Types.ObjectId.isValid(value) || 
        (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value))
      );
      
    case 'Array':
      return Array.isArray(value);
      
    case 'Map':
    case 'Mixed':
      return true; // Accept any type for Mixed or Map
      
    default:
      return true; // For unknown types, assume valid
  }
}

/**
 * Validate a specific document against a model and return detailed validation results
 * @param {Object} document - The document to validate
 * @param {mongoose.Model} model - The Mongoose model to validate against
 * @returns {Promise<Object>} - Validation results with details
 */
async function validateDocument(document, model) {
  try {
    // Create a model instance without saving
    const instance = new model(document);
    
    // Run Mongoose validation
    await instance.validate();
    
    return {
      isValid: true,
      document: instance.toObject(),
      errors: []
    };
  } catch (error) {
    // Handle Mongoose validation errors
    const validationErrors = [];
    
    if (error.name === 'ValidationError') {
      for (const field in error.errors) {
        validationErrors.push({
          field,
          message: error.errors[field].message,
          value: error.errors[field].value
        });
      }
    } else {
      validationErrors.push({
        message: error.message
      });
    }
    
    return {
      isValid: false,
      errors: validationErrors
    };
  }
}

/**
 * Batch validate an array of documents against a model
 * @param {Array<Object>} documents - The documents to validate
 * @param {mongoose.Model} model - The Mongoose model to validate against
 * @returns {Promise<Object>} - Batch validation results
 */
async function batchValidate(documents, model) {
  if (!Array.isArray(documents)) {
    throw new Error('Documents must be an array');
  }
  
  const results = {
    total: documents.length,
    valid: 0,
    invalid: 0,
    details: []
  };
  
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    const validation = await validateDocument(document, model);
    
    if (validation.isValid) {
      results.valid++;
      results.details.push({
        index: i,
        isValid: true
      });
    } else {
      results.invalid++;
      results.details.push({
        index: i,
        isValid: false,
        errors: validation.errors
      });
    }
  }
  
  return results;
}

module.exports = {
  validateData,
  validateDocument,
  batchValidate
};
