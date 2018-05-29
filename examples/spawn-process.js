const {ForeverChildProcess} = require('../src');
const foreverChildProcess = new ForeverChildProcess();

foreverChildProcess.fork(`${__dirname}/fail-process`);