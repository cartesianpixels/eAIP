const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'data', 'schedules', 'GMMN.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(data);
  console.log('JSON is valid.');
  console.log(`Found ${json.length} flight entries.`);
  
  // Basic Schema Validation
  let errors = [];
  json.forEach((flight, index) => {
    if (!flight.flightNumber) errors.push(`Entry ${index}: Missing flightNumber`);
    if (!flight.airline) errors.push(`Entry ${index}: Missing airline`);
    if (!flight.origin) errors.push(`Entry ${index}: Missing origin`);
    if (!flight.destination) errors.push(`Entry ${index}: Missing destination`);
  });

  if (errors.length > 0) {
    console.log('Found schema errors:');
    errors.forEach(err => console.log(err));
  } else {
    console.log('Schema validation passed (basic checks).');
  }

} catch (err) {
  console.error('Invalid JSON:', err.message);
}
