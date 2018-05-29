const {ForeverChildProcess} = require('../src');
const foreverChildProcess = new ForeverChildProcess();

foreverChildProcess.on('child' , (child)=>{
    child.on('data' , (msg)=>{
        console.log(msg.toString())
    })
})
foreverChildProcess.fork(`${__dirname}/fail-process`);