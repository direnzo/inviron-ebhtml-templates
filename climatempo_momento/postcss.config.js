// Resolve modulos globais (pacotes instalados com npm -g)
// gap em flex containers: usar space-x-*/space-y-* no HTML (Chrome < 84)
var path = require('path');
var globalPath = path.resolve(process.execPath, '../../lib/node_modules');
// Fallback: tenta npm root -g
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