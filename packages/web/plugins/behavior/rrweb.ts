
import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import * as rrweb from "rrweb";
import { EventName } from "..";
export class RrwebPlugin implements Plugin {
    monitor: WebMonitor
    constructor(instance: WebMonitor) {
        this.monitor = instance
    }
    run() {
        const instance = this.monitor
        rrweb.record({
            emit(event: any) {
                instance.call(EventName.RrwebEvent, event);
            }
        })
    }
}


