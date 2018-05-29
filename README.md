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
## License

  [MIT](LICENSE)