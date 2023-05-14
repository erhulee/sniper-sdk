import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import { work_source } from "./webwork"
import { CrashLogger } from "web/logger"
import { EventName } from "web/plugins"
import { LimitQueue } from "web/utils/LimitQueue"

export class CrashPlugin implements Plugin {
    monitor: WebMonitor
    worker: Worker | null
    rrwebQueue: LimitQueue<any>
    constructor(instance: WebMonitor) {
        this.monitor = instance
        this.worker = null
        this.rrwebQueue = new LimitQueue<any>(100);
    }
    init() {

    }
    run() {
        const content = new Blob([work_source]);
        const worker = new Worker(URL.createObjectURL(content));
        this.worker = worker;
        worker.postMessage({
            type: "init",
            endpoint: this.monitor.endpoint,
            method: this.monitor.method,
            logger: new CrashLogger(),
            appid: this.monitor.appid
        })

        worker.addEventListener("message", (message) => {
            const data = message.data;
            worker.postMessage({
                type: "sync",
                data,
                rrwebStack: this.rrwebQueue
            })
        })

    }
    unload() {
        if (this.worker) {
            this.worker.terminate()
        }
    }
    events = {
        [EventName.RrwebEvent]: (event: any) => {
            this.rrwebQueue.add(event)
        }
    }
}

