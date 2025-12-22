const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const constructionsDir = path.join(__dirname, 'data/constructions');
const files = fs.readdirSync(constructionsDir).filter(f => f.endsWith('.yaml'));

const constructions = {};
const idToFilename = {};

// 1. Load all constructions
files.forEach(file => {
  try {
    const content = yaml.load(fs.readFileSync(path.join(constructionsDir, file), 'utf8'));
    if (content.id) {
      const id = content.id.toLowerCase();
      const existingFile = idToFilename[id];
      if (existingFile) {
        console.warn(`[DUPLICATE ID] ID '${content.id}' found in both '${existingFile}' and '${file}'`);
      }
      constructions[id] = content;
      idToFilename[id] = file;
    } else {
      console.warn(`[MISSING ID] File '${file}' has no 'id' field.`);
    }
  } catch (e) {
    console.error(`[PARSE ERROR] File '${file}': ${e.message}`);
  }
});

const constructionIds = new Set(Object.keys(constructions));
const report = [];

function log(type, msg) {
  report.push(`[${type}] ${msg}`);
}

// Helper to find IDs in text
const idRegex = /\b[a-zA-Z]+(?:-[a-zA-Z]+)*-[0-9]{3}\b/g;

// 2. Audit
Object.values(constructions).forEach(c => {
  const cid = c.id;
  
  // A. Check internal relation references
  if (c.meanings) {
    Object.entries(c.meanings).forEach(([mKey, mVal]) => {
      if (mVal.relations) {
        mVal.relations.forEach(relIndex => {
          if (!c.relations || !c.relations[relIndex]) {
            log('DANGLING_RELATION_REF', `Construction '${cid}' (meaning '${mKey}') references relation '${relIndex}', but it is not defined in top-level 'relations'.`);
          }
        });
      }
    });
  }

  // B. Check top-level relations validity
  if (c.relations) {
    Object.entries(c.relations).forEach(([rKey, rVal]) => {
      if (rVal.construction) {
        const targetId = rVal.construction.toLowerCase();
        if (!constructionIds.has(targetId)) {
          log('BROKEN_RELATION_LINK', `Construction '${cid}' relates to non-existent ID '${rVal.construction}' (type: ${rVal.type}).`);
        }
      } else {
         log('MALFORMED_RELATION', `Construction '${cid}' relation '${rKey}' missing 'construction' field.`);
      }
    });
  }

  // C. Check Pattern for Mereological Hints
  if (c.pattern) {
    const matches = c.pattern.match(idRegex) || [];
    matches.forEach(match => {
      const matchId = match.toLowerCase();
      
      // 1. Does the ID exist?
      if (!constructionIds.has(matchId)) {
        log('BROKEN_PATTERN_LINK', `Construction '${cid}' pattern references non-existent ID '${match}'.`);
      } else {
        // 2. Is it formally linked as a constituent/part?
        // We look for relation types: 'contains', 'can-contain', 'often-contains', 'requires' (not in enum but maybe implied?)
        // Enum: can-manifest-as, often-contains, overlaps-with, can-contain, inherits-from, similar-to, related-to, transformed-from, specialization-of, implements, see-also
        
        let linked = false;
        if (c.relations) {
           linked = Object.values(c.relations).some(r => 
             r.construction && 
             r.construction.toLowerCase() === matchId && 
             ['contains', 'can-contain', 'often-contains', 'specialization-of', 'inherits-from', 'implements'].includes(r.type)
           );
        }
        
        // Also check legacy relatedConstructions if needed
        if (!linked && c.relatedConstructions) {
            linked = c.relatedConstructions.some(r => r.id && r.id.toLowerCase() === matchId);
        }

        if (!linked) {
          log('UNFORMALIZED_PART', `Construction '${cid}' pattern mentions '${match}', but no formal relation links them.`);
        }
      }
    });
  }
});

// 3. Exhaustive Pairwise Check for Cycles (only on explicit containment)
// We build a graph of 'contains'/'can-contain'/'often-contains'
const graph = {};
constructionIds.forEach(id => graph[id] = []);

Object.values(constructions).forEach(c => {
  if (c.relations) {
    Object.values(c.relations).forEach(r => {
      if (['contains', 'can-contain', 'often-contains'].includes(r.type)) {
        const target = r.construction.toLowerCase();
        if (constructionIds.has(target)) {
          graph[c.id.toLowerCase()].push(target);
        }
      }
    });
  }
});

// Simple DFS for cycles
const visited = new Set();
const recursionStack = new Set();
let cyclesFound = 0;

function hasCycle(node, pathStr) {
  visited.add(node);
  recursionStack.add(node);
  
  for (const neighbor of (graph[node] || [])) {
    if (!visited.has(neighbor)) {
      if (hasCycle(neighbor, pathStr + ' -> ' + neighbor)) return true;
    } else if (recursionStack.has(neighbor)) {
      log('CYCLE_DETECTED', `Cycle found: ${pathStr} -> ${neighbor}`);
      cyclesFound++;
      return true;
    }
  }
  
  recursionStack.delete(node);
  return false;
}

constructionIds.forEach(id => {
  if (!visited.has(id)) {
    hasCycle(id, id);
  }
});

// Output
console.log(`Audit Complete. Found ${report.length} issues.`);
report.sort().forEach(r => console.log(r));
