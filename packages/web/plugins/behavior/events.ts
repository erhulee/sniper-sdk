
import { Plugin } from "sniper-core"
import { EventName } from ".."
import WebMonitor from "../../index"

/*
    history: popState 事件
    hash: pushSate / replaceState 重写
*/

export class EventsPlugin implements Plugin {
    monitor: WebMonitor
    eventKeys = ["click", "input", "keydown", "keyup"]
    collectEventHandle = (e: any) => {
        const pathName = location.href;
        this.monitor.call(EventName.EventHappens, {
            pathName,
            event: e
        })
    }
    constructor(monitor: WebMonitor) {
        this.monitor = monitor
    }
    init() {

    }
    async run() {
        this.eventKeys.forEach((event) => {
            document.addEventListener(event, this.collectEventHandle)
        })
    }
    unload() {
        this.eventKeys.forEach((event) => {
            document.removeEventListener(event, this.collectEventHandle)
        })
    }

}


