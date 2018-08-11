# Forver process

`forever-process` makes sure that your child process scripts will run forever.

## Simple usage

```js
const {ForeverChildProcess} = require('forever-process');
const foreverChildProcess = new ForeverChildProcess();

foreverChildProcess.on('child' , (child)=>{
    child.on('data' , (msg)=>{
        console.log(msg.toString())
    })
})
foreverChildProcess.fork(`${__dirname}/fail-process`);

```

## Advanced usage

```js

const {ForeverChildProcess} = require('forever-process');
const foreverChildProcess = new ForeverChildProcess({
    //You can overide any of the following settings

    fork : ()=>{ /* You can overide, just remeber to return the child instance */},
    spawn : ()=>{ /* You can overide, just remeber to return the child instance */},
    minUptime : 1000,
    spinSleepTime : 30000,
    spinIdentifyTime : 30000,
    spinCounter : 8
});

foreverChildProcess.on('child' , (child)=>{
    child.on('data' , (msg)=>{
        console.log(msg.toString())
    })
})
foreverChildProcess.fork(`${__dirname}/fail-process`); 

```
## License

  [MIT](LICENSE)