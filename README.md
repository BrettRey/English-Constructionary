# English Constructionary

A collaborative dictionary of English constructions in the Construction Grammar (CxG) framework. This project documents form-meaning pairings beyond individual lexical items, focusing on morphosyntactic patterns and constructions.

**Read the Constructionary:** https://brettreynolds.ca/constructionary/, in four editions: curious reader (the default), teacher, linguist and child. Machines can start at https://brettreynolds.ca/constructionary/llms.txt.

The repository browser at https://brettrey.github.io/English-Constructionary/ still lists the raw files.

## Overview

The English Constructionary catalogs and describes grammatical constructions, documenting:
- Formal patterns
- Core and extended meanings
- Usage constraints
- Examples with analysis
- Related constructions

## Project Structure
constructionary/
├── data/
│   ├── constructions/      # YAML files for each construction (the linguist edition)
│   ├── editions/          # Curious-reader, teacher and child editions of each entry
│   ├── schemas/           # JSON schemas for validation
│   └── indices/           # Cross-reference files
├── docs/                  # Documentation
├── site/                 # Assets for the brettreynolds.ca site (built by scripts/build-site.js)
└── web/                  # Repository file browser (github.io)

`npm run build:site` writes the website edition into a checkout of the website repository; `npm run check:editions` checks reader editions against their entries with a second model.

## Contributing

We welcome contributions from linguists and researchers. Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for:
- Data format specifications
- Style guide
- Review process
- Code of conduct

## License

Code is licensed under the MIT License (see [LICENSE](LICENSE)). The construction entries, reader editions and other text in `data/` are licensed under [CC BY 4.0](site/content-license.txt), except the lexicon layer derived from Simple English Wiktionary (`data/lexicon/gold/` and `data/lexicon/glosses.yaml`), which keeps CC BY-SA 4.0.

## Citation

If you use this resource in your research, please cite:
@misc{english-constructionary,
	title = {English Constructionary: A Collaborative Resource for Construction Grammar},
	year = {2024--},
	author = {Brett Reynolds and Contributors},
	url = {https://github.com/BrettRey/English-Constructionary}
}

## Contact

For questions or suggestions, please:
1. Open an issue in this repository
2. Contact the project maintainers through GitHub discussions