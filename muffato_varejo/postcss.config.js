// Resolve pacotes instalados globalmente (npm install -g)
// Necessário porque o projeto não tem node_modules local
var path = require('path');
var globalPath = path.resolve(process.execPath, '../../lib/node_modules');
try {
  var childProcess = require('child_process');
  globalPath = childProcess.execSync('npm root -g').toString().trim();
} catch(e) {}

function globalRequire(name) {
  try {
    return require(name);
  } catch(e) {
    return require(globalPath + '/' + name);
  }
}

module.exports = {
  plugins: [
    globalRequire('tailwindcss'),
    globalRequire('autoprefixer')
  ]
};
