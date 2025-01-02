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

    // Use this line to get all files that end with .yaml
    const files = fs.readdirSync(constructionsDir).filter(f => f.endsWith('.yaml'));

    // Use this line to only get specific files you listed
    // const files = ['np-bare-001.yaml','np-det-001.yaml','n-sg-001.yaml','n-pl-001.yaml','n-mass-001.yaml','nom-premod-000.yaml','nom-adjp-mod-001.yaml','nom-n-mod-001.yaml', 'np-def-001.yaml', 'np-indef-001.yaml', 'np-001.yaml', 'np-common-001.yaml', 'np-proper-name-001.yaml', 'np-proper-noun-001.yaml', 'np-pron-001.yaml', 'np-def-aspect-001.yaml', 'np-commonized-proper-name-001.yaml', 'np-commonized-pron-001.yaml'];

    console.log('Found files:', files);

    let hasErrors = false;

    files.forEach(file => {
        console.log(`Processing file: ${file}`);
        const filePath = path.join(constructionsDir, file); // Construct full file path
        const content = yaml.load(fs.readFileSync(filePath, 'utf8')); // Use filePath here
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