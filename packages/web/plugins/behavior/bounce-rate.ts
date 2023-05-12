// 跳出率
import { BounceRateLogger } from "../../logger";
import WebMonitor from "../../index"
import { Plugin } from "sniper-core"
import { EventName } from "..";

const DEFAULT_BOUNCE_RATE_EVENT_COUNT = 2;
export class BounceRatePlugin implements Plugin {
    monitor: WebMonitor
    // 上一次访问的地址
    prePath!: string
    // 事件发生队列
    eventsQueue: Array<{
        pathName: string,
        event: Event
    }>
    constructor(monitor: WebMonitor) {
        this.monitor = monitor
        this.eventsQueue = [];
    }
    init() {
        this.prePath = location.href;
    }
    run() {
        const _trackPV = this.monitor.trackPV;
        this.monitor.trackPV = () => {
            _trackPV.call(this.monitor);
            const curPath = location.href;
            const prePath = this.prePath;
            const activeEventCount = this.eventsQueue.filter((item) => prePath == item.pathName).length;
            if (activeEventCount <= DEFAULT_BOUNCE_RATE_EVENT_COUNT) {
                const log = new BounceRateLogger(this.prePath);
                this.monitor.send(log)
            }
            this.prePath = curPath;
        }
    }
    events = {
        [EventName.EventHappens]: (event: any) => {
            while (this.eventsQueue.length >= 20) {
                this.eventsQueue.shift();
            }
            this.eventsQueue.push(event);
        }
    }
}


