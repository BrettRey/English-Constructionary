import os

# Map filenames to their new type
assignments = {
    # Semantic
    "definite-001.yaml": "semantic",
    "indefinite-001.yaml": "semantic",
    "grammatical-definiteness-001.yaml": "semantic",
    "grammatical-number-001.yaml": "semantic",
    "degree-001.yaml": "semantic",
    "gradation-001.yaml": "semantic",
    "quasi-count-noun-001.yaml": "semantic",

    # Morphological
    "plural-s-001.yaml": "morphological",
    "past-tense-ed-001.yaml": "morphological",
    "comparative-er-001.yaml": "morphological",
    "genitive-s-001.yaml": "morphological",
    "progressive-ing-001.yaml": "morphological",

    # Syntactic (Categories & Structures)
    "plural-001.yaml": "syntactic",
    "singular-001.yaml": "syntactic",
    "n-common-001.yaml": "syntactic",
    "n-common-pl-001.yaml": "syntactic",
    "n-mass-001.yaml": "syntactic",
    "n-pl-001.yaml": "syntactic",
    "n-sg-001.yaml": "syntactic",
    "np-001.yaml": "syntactic",
    "np-bare-001.yaml": "syntactic",
    "NP-bare-role.yaml": "syntactic",
    "np-common-001.yaml": "syntactic",
    "np-def-001.yaml": "syntactic",
    "np-det-001.yaml": "syntactic",
    "np-gen-indep-001.yaml": "syntactic",
    "np-indef-001.yaml": "syntactic",
    "np-pron-001.yaml": "syntactic",
    "np-pron-interrog-gen-indep-001.yaml": "syntactic",
    "np-pron-personal-gen-indep-001.yaml": "syntactic",
    "np-proper-001.yaml": "syntactic",
    "nom-001.yaml": "syntactic",
    "nom-premod-000.yaml": "syntactic",
    "nom-n-mod-001.yaml": "syntactic",
    "nom-adjp-mod-001.yaml": "syntactic",
    "nom_prehead_mod.yaml": "syntactic", # Check spelling/name
    "prenominal_modifier.yaml": "syntactic", # Check spelling/name
    "cardinal-noun-001.yaml": "syntactic",
    "cardinal-noun-common-001.yaml": "syntactic",
    "cardinal-noun-proper-001.yaml": "syntactic",
    "adjective-001.yaml": "syntactic",
    "cardinal-determinative-001.yaml": "syntactic",
    "minor-determiner-001.yaml": "syntactic",
    "no-determiner-001.yaml": "syntactic",
    "subject-determiner-001.yaml": "syntactic",
    "determination-001.yaml": "syntactic",
    "absolute-negator-pronoun-001.yaml": "syntactic",
    "constituent-not-negation-001.yaml": "syntactic",
    "imperative-negation-do-001.yaml": "syntactic",
    "neither-nor-coordination-001.yaml": "syntactic",
    "never-adv-negation-001.yaml": "syntactic",
    "interrogative-word-001.yaml": "syntactic",
    "secondary-verbal-negation-001.yaml": "syntactic",
    "independent-genitive-pronoun-001.yaml": "syntactic",
    "perfect-have-001.yaml": "syntactic",
    "verb-number-agreement-001.yaml": "syntactic",
}

base_dir = "data/constructions"

for filename, type_val in assignments.items():
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename}: Not found")
        continue
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Check if already typed
    if any(line.strip().startswith("type:") for line in lines):
        # Update existing type
        new_lines = []
        for line in lines:
            if line.strip().startswith("type:"):
                new_lines.append(f"type: {type_val}\n")
            else:
                new_lines.append(line)
        
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"Updated {filename} -> {type_val}")
        
    else:
        # Insert type after pattern
        new_lines = []
        inserted = False
        for line in lines:
            new_lines.append(line)
            if line.startswith("pattern:") and not inserted:
                # Check next line to avoid double insert if logic fails
                new_lines.append(f"type: {type_val}\n")
                inserted = True
        
        if not inserted:
             # Fallback: insert after name
             new_lines = []
             for line in lines:
                new_lines.append(line)
                if line.startswith("name:") and not inserted:
                    new_lines.append(f"type: {type_val}\n")
                    inserted = True

        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"Tagged {filename} -> {type_val}")
