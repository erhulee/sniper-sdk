import WebMonitor from "web/core/WebMonitor";
import { Plugin } from "@sniper/core"
import { JSErrorLogger, PromiseErrorLogger } from "web/logger";

export class JSErrorPlugin implements Plugin {
    monitor: WebMonitor;
    error_listener: any;
    promise_listener: any;
    constructor(instance: WebMonitor) {
        this.monitor = instance;

    }
    init() {
        this.error_listener = (e: ErrorEvent) => {
            const log = new JSErrorLogger(e.message, e.error?.stack, this.monitor.rrwebStack)
            this.monitor.send(log)
        }
        this.promise_listener = (e: ErrorEvent) => {
            // if ((e as any).target.localname !== undefined) return;
            const log = new PromiseErrorLogger(e.message, e.error?.stack, this.monitor.rrwebStack)
            this.monitor.send(log)
        }
    }
    run() {
        this.monitor.trackJSError = (e: Error) => {
            const log = new JSErrorLogger(e.message, e?.stack || "", this.monitor.rrwebStack)
            this.monitor.send(log)
        }
        window.addEventListener("error", this.error_listener)
        window.addEventListener("unhandledrejection", this.promise_listener)
    }
    unload() {
        window.removeEventListener("error", this.error_listener)
        window.removeEventListener("unhandledrejection", this.promise_listener)
    }

}