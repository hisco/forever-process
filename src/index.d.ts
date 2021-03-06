import { EventEmitter } from "events";

declare module ForeverProcess {
	export interface ForeverChildProcessParams{
		fork?:()=>number;
		spawn?:()=>number;
		minUptime?:number;
		spinSleepTime?:number;
		spinIdentifyTime?:number;
		spinCounter?:number;
	}
	export interface ForkOptions {
		cwd?: string;
		env?: any;
		execPath?: string;
		execArgv?: string[];
		silent?: boolean;
		stdio?: any[];
		uid?: number;
		gid?: number;
		windowsVerbatimArguments?: boolean;
	}
	export interface SpawnOptions {
        cwd?: string;
        env?: any;
        stdio?: any;
        detached?: boolean;
        uid?: number;
        gid?: number;
        shell?: boolean | string;
        windowsVerbatimArguments?: boolean;
        windowsHide?: boolean;
	}
	
    export class RestartInfo{
		constructor();
	}
	export class ForeverChildProcess  extends EventEmitter  {
		constructor(params? : ForeverChildProcessParams);
		status:string;
		fork(modulePath: string, args?: string[], options?: ForkOptions): void;
		spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): void;
		stop(signal?: string): void;
		kill(signal?: string): void;
	}

	export function fork(modulePath: string, args?: string[], options?: ForkOptions): ForeverChildProcess;
	export function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): ForeverChildProcess;
	
}

export = ForeverProcess;