const { EventEmitter } = require('events');

class ForeverChildProcess extends EventEmitter{
    get Date(){
        return Date;
    }
    constructor(options){
        super(options);
        this._init(options || {});
    }
    _init({
        fork,
        spawn,
        minUptime,
        spinSleepTime
    }){
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
        if (this.process)
            throw new Error('If you wish to fork another process kill the last one');

        this.lastRestart = this.Date.now();

        const child = this['_'+name](...args);
        this.process = child;
        this.emit('child' , child);
        this._watcher = this._watchProcess(child , ()=>{
            this[name](...args);
        });
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