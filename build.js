// Inlines the engine and results into the single-file page: index.html.
const fs = require('fs');
const page = fs.readFileSync('src/template.html', 'utf8')
  .replace('/*ENGINE*/', fs.readFileSync('src/engine.js', 'utf8'))
  .replace('/*PRE*/', fs.readFileSync('results/results.json', 'utf8'));
fs.writeFileSync('index.html', `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${page}\n</body>\n</html>\n`);
console.log('Wrote index.html');
