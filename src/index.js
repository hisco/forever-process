const { EventEmitter } = require('events');

class ForeverChildProcess extends EventEmitter{
    get Date(){
        return Date;
    }
    get status(){
        return this._state;
    }
    constructor(options){
        super(options);
        this._init(options || {});
    }
    _init({
        fork,
        spawn,
        minUptime = 1000,
        spinSleepTime = 30000,
        spinIdentifyTime = 30000,
        spinCounter = 8
    }){
        this._state = 'init';
        this.minUptime = minUptime;
        this.spinSleepTime = spinSleepTime;
        this.spinValidation  = new SpinValidation(
            spinCounter,
            spinIdentifyTime
        );
        if (fork)
            this._fork = fork;
        else
            this._setChildProcessFork();

        if (spawn)
            this._spawn = spawn;
        else
            this._setChildProcessSpawn();
    }
    _notifyRestart(child){
        this.emit('removed', child);
        this._state = 'stopped';
        this.spinValidation.restart();
        this.lastRestart = this.Date.now();
    }
    _watchProcess(child ,  onKilled){
        let alreadyKilled = false;
        const restartProcess = ()=>{
            if (!alreadyKilled){
                this._notifyRestart(child);
                this.forceKill(child , 3);
                this.process = null;
                onKilled();
                alreadyKilled = true;
            }
        }
        child.on('error' , restartProcess);
        child.on('disconnect' , restartProcess);
        child.on('exit' , restartProcess);

        return function stopListen(){
            alreadyKilled = true;
        }
    }

    _createProcess(name , args){
        const previousState = this._state;
        if (this.process){
            throw new Error('If you wish to fork another process kill the last one');
        }

        this._state = 'starting';
        const isRestart = this.lastRestart != undefined;
        const uptime = this.lastRestart - this.lastStart;

        let whenToCreateProcess = 4;
        if ( isRestart && uptime < this.minUptime ){
            this._state = previousState;
            whenToCreateProcess = this.minUptime  - uptime;
        }
        if (this.spinValidation.isSpining){
            this._state = 'spinning';
            whenToCreateProcess = this.spinSleepTime;
        }

        setTimeout(()=>{
            if (this.process){
                this._state = previousState;
                throw new Error('If you wish to fork another process kill the last one');
            }
            this._state = 'starting';

            this.lastStart = this.Date.now();

            const child = this['_'+name](...args);
            this._state = 'running';

            this.process = child;
            this.emit('child' , child);
            this._watcher = this._watchProcess(child , ()=>{
                this[name](...args);
            });
        } ,whenToCreateProcess);
    }
    
    fork(){
        this._createProcess('fork' , arguments);
    }
    spawn(){
        this._createProcess('spawn' , arguments);
    }
    
    stop(n){
        if ( this._watcher)
            this._watcher();
        if (this.process)
            this.forceKill(this.process , n)
    }
    kill(n){
        this.forceKill(this.process,n)
    }

    forceKill(child , n){
        try{
            child.kill(n)
        }
        catch(err){
            try{
                throw child.kill(n)
            }
            catch(err){
                
            }
        }
    }
    _setChildProcessFork(){
        const {fork } = require('child_process');
        this._fork = fork;
    }
    _setChildProcessSpawn(){
        const {spawn} = require('child_process');
        this._spawn = spawn;
    }
}

class SpinValidation{
    constructor(
        spinCounter,
        spinIdentifyTime
    ){
        this.counter = 0;
        this.spinIdentifyTime = spinIdentifyTime;
        this.spinCounter = spinCounter;
    }
    restart(){
        this.counter++;
        this.lastRestart = Date.now();

        if (this.timeout){
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(()=>{
            this.counter = 0;
        } , this.spinIdentifyTime)
    }
    get isSpining(){
        return this.counter > this.spinCounter;
    }
}

function fork(options){
    const cp = new ForeverChildProcess(options);
    cp.fork(...arguments);
    return cp;
}
function spawn(){
    const cp = new ForeverChildProcess(options);
    cp.spawn(...arguments);
    return cp;
}



module.exports = {
    fork,
    spawn,
    ForeverChildProcess
}