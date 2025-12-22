const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

const schemaPath = path.join(__dirname, '../data/schemas/construction.json');
const constructionsDir = path.join(__dirname, '../data/constructions');

const formatError = (error) => {
  const instancePath = error.instancePath ? error.instancePath : '/';
  const detail = error.message ? `: ${error.message}` : '';
  return `- ${instancePath}${detail}`;
};

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  const files = fs.readdirSync(constructionsDir).filter((file) => file.endsWith('.yaml')).sort();

  let errorCount = 0;

  files.forEach((file) => {
    const filePath = path.join(constructionsDir, file);
    let content;

    try {
      content = yaml.load(fs.readFileSync(filePath, 'utf8'));
    } catch (parseError) {
      console.error(`\n${file} failed YAML parsing: ${parseError.message}`);
      errorCount += 1;
      return;
    }

    const valid = validate(content);
    if (!valid) {
      console.error(`\n${file} failed schema validation:`);
      validate.errors.forEach((error) => {
        console.error(formatError(error));
      });
      errorCount += 1;
    }
  });

  if (errorCount > 0) {
    console.error(`\n${errorCount} file(s) failed validation.`);
    process.exit(1);
  } else {
    console.log('All YAML files are valid.');
  }
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}
