
import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import * as rrweb from "rrweb";
export class RrwebPlugin implements Plugin {
    monitor: WebMonitor
    constructor(instance: WebMonitor) {
        this.monitor = instance
    }
    init() {

    }
    async run() {
        const instance = this.monitor
        rrweb.record({
            emit(event: any) {
                instance.rrwebStack.push(event);
            }
        })
    }
    unload() {

    }

}


