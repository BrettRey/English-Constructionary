# English Constructionary

## Project Overview
The **English Constructionary** is a collaborative dictionary of English constructions based on the Construction Grammar (CxG) framework. It documents form-meaning pairings, focusing on morphosyntactic patterns, definitions, and usage constraints. The project is data-centric, storing constructions as YAML files which are validated against a strict JSON schema. It also includes a web-based viewer for exploring the data.

## Building and Running

### Prerequisites
- Node.js and npm

### Key Commands
*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Validate Data:**
    Runs schema validation on all construction YAML files.
    ```bash
    npm run validate
    ```
*   **Lint Project:**
    Lints the JavaScript and YAML files.
    ```bash
    npm run lint
    ```
*   **Build Web Manifest:**
    Generates the index/manifest required for the web viewer.
    ```bash
    npm run build:web
    ```
*   **Run Web Interface:**
    Starts a local server to view the Constructionary in a browser.
    ```bash
    npm run web
    ```
    (Default URL: `http://localhost:8000/web/`)

## Development Conventions

### Data Structure (`data/`)
*   **`data/constructions/*.yaml`**: The core construction definitions. Each file represents one construction.
*   **`data/schemas/construction.json`**: The JSON schema that defines the valid structure for construction entries.
*   **`data/indices/`**: Shared registries for referencing cross-construction data:
    *   `semantic-features.yaml`: Semantic property clusters (e.g., definiteness).
    *   `form-features.yaml`: Form/lexical classes.
    *   `syntactic-diagnostics.yaml`: Shared syntactic diagnostics.

### Authoring Guidelines
*   **IDs:** Must match the regex `^[a-z-]+[0-9]{3}$` (e.g., `np-001`, `subject-determiner-001`).
*   **Terminology:** Use **CGEL** (Cambridge Grammar of the English Language) terminology (e.g., *determinative* instead of *determiner*, *genitive* instead of *possessive*).
*   **Meanings:** Indexed by integer strings (`"1"`, `"2"`, ...). Can be defined inline or implement another construction's meaning.
*   **HPC Metadata:** Optional `hpc` block for documenting "Hyper-Plastic Construction" properties (clusters, stabilisers, diagnostics).

### Validation
*   Always run `npm run validate` after modifying any YAML files in `data/constructions/`.
*   The validation script uses `ajv` to enforce the schema defined in `data/schemas/construction.json`.

### Web Interface
*   The web interface reads the YAML files directly via HTTP.
*   Run `npm run build:web` to update the manifest if you add or rename files.
