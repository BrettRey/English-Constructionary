const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');

const ajv = new Ajv();

// Add debug logging
console.log('Starting validation script...');

// Read schema
const schemaPath = path.join(__dirname, '../data/schemas/construction.json');
console.log('Looking for schema at:', schemaPath);

try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    console.log('Schema loaded successfully');
    
    const validate = ajv.compile(schema);

    // Get all YAML files
    const constructionsDir = path.join(__dirname, '../data/constructions');
    console.log('Looking for YAML files in:', constructionsDir);
    
    const files = fs.readdirSync(constructionsDir).filter(f => f.endsWith('.yaml'));
    console.log('Found files:', files);

    let hasErrors = false;

    files.forEach(file => {
        console.log(`Processing file: ${file}`);
        const content = yaml.load(fs.readFileSync(path.join(constructionsDir, file), 'utf8'));
        const valid = validate(content);
        
        if (!valid) {
            console.error(`\nValidation errors in ${file}:`);
            console.error(validate.errors);
            hasErrors = true;
        } else {
            console.log(`✓ ${file} is valid`);
        }
    });

    if (hasErrors) {
        process.exit(1);
    } else {
        console.log('\nAll files are valid!');
    }
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}