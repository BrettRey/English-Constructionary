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
  const knownConstructions = new Set();

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
    } else {
      knownConstructions.add(content.id);
    }
  });

  // Lexicon layer: overrides validated against their own schema; gold lists parse-checked
  const lexiconSchemaPath = path.join(__dirname, '../data/schemas/lexicon-override.json');
  const overridesPath = path.join(__dirname, '../data/lexicon/overrides.yaml');
  if (fs.existsSync(lexiconSchemaPath) && fs.existsSync(overridesPath)) {
    ajv.addSchema(JSON.parse(fs.readFileSync(lexiconSchemaPath, 'utf8')), 'lexicon-override.json');
    const lexiconValidate = ajv.getSchema('lexicon-override.json');
    try {
      const overrides = yaml.load(fs.readFileSync(overridesPath, 'utf8'));
      if (!lexiconValidate(overrides)) {
        console.error('\ndata/lexicon/overrides.yaml failed schema validation:');
        lexiconValidate.errors.forEach((error) => console.error(formatError(error)));
        errorCount += 1;
      }
    } catch (parseError) {
      console.error(`\ndata/lexicon/overrides.yaml failed YAML parsing: ${parseError.message}`);
      errorCount += 1;
    }
  }

  const profilesPath = path.join(__dirname, '../data/lexicon/profiles.yaml');
  const profilesSchemaPath = path.join(__dirname, '../data/schemas/lexicon-profile.json');
  const validateProfiles = ajv.compile(JSON.parse(fs.readFileSync(profilesSchemaPath, 'utf8')));
  const profiles = yaml.load(fs.readFileSync(profilesPath, 'utf8'));
  if (!validateProfiles(profiles)) {
    console.error('\ndata/lexicon/profiles.yaml failed schema validation:');
    validateProfiles.errors.forEach((error) => console.error(formatError(error)));
    errorCount += 1;
  } else {
    const profileKeys = new Set();
    for (const record of profiles.records) {
      const key = `${record.lemma} / ${record['source-pos']}`;
      const useIds = new Set();
      if (profileKeys.has(key)) {
        console.error(`data/lexicon/profiles.yaml: duplicate profile '${key}'`);
        errorCount += 1;
      }
      profileKeys.add(key);
      for (const use of record.uses) {
        if (useIds.has(use.id)) {
          console.error(`data/lexicon/profiles.yaml: duplicate use '${use.id}' for '${key}'`);
          errorCount += 1;
        }
        useIds.add(use.id);
        for (const link of use.links) {
          if (!knownConstructions.has(link.construction)) {
            console.error(`data/lexicon/profiles.yaml: unknown construction '${link.construction}' for '${key}'`);
            errorCount += 1;
          }
        }
      }
    }
  }
  const goldDir = path.join(__dirname, '../data/lexicon/gold');
  if (fs.existsSync(goldDir)) {
    fs.readdirSync(goldDir).filter((file) => file.endsWith('.yaml')).forEach((file) => {
      try {
        yaml.load(fs.readFileSync(path.join(goldDir, file), 'utf8'));
      } catch (parseError) {
        console.error(`\ndata/lexicon/gold/${file} failed YAML parsing: ${parseError.message}`);
        errorCount += 1;
      }
    });
  }

  // Grounds resolution: every grounds[].source must exist in data/sources.yaml
  const sourcesPath = path.join(__dirname, '../data/sources.yaml');
  if (fs.existsSync(sourcesPath)) {
    const registry = yaml.load(fs.readFileSync(sourcesPath, 'utf8'));
    const knownSources = new Set(Object.keys((registry && registry.sources) || {}));
    const collectGrounds = (node, found) => {
      if (Array.isArray(node)) {
        node.forEach((child) => collectGrounds(child, found));
      } else if (node && typeof node === 'object') {
        if (Array.isArray(node.grounds)) {
          node.grounds.forEach((g) => found.push(g));
        }
        Object.entries(node).forEach(([key, child]) => {
          if (key !== 'grounds') collectGrounds(child, found);
        });
      }
    };
    const checkFile = (label, doc) => {
      const found = [];
      collectGrounds(doc, found);
      found.forEach((g) => {
        if (g && g.source && !knownSources.has(g.source)) {
          console.error(`\n${label}: grounds source '${g.source}' not in data/sources.yaml`);
          errorCount += 1;
        }
      });
    };
    files.forEach((file) => {
      try {
        checkFile(file, yaml.load(fs.readFileSync(path.join(constructionsDir, file), 'utf8')));
      } catch (parseError) { /* already reported above */ }
    });
    if (fs.existsSync(overridesPath)) {
      try {
        checkFile('data/lexicon/overrides.yaml', yaml.load(fs.readFileSync(overridesPath, 'utf8')));
      } catch (parseError) { /* already reported above */ }
    }
    checkFile('data/lexicon/profiles.yaml', profiles);
  }

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
