import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import { PVLogger } from "web/logger"

// PV探测在SDK方很难实现
// plugin 覆盖 monitor 上的 TrackPV 方法，提供给开发者更好的 PV 上报体验

export class PVPlugin implements Plugin {
    monitor: WebMonitor
    constructor(monitor: WebMonitor) {
        this.monitor = monitor
    }
    run() {
        const _trackPV = this.monitor.trackPV;
        this.monitor.trackPV = () => {
            const uid = this.monitor.uid ?? "unknown";
            const log = new PVLogger(uid);
            this.monitor.send(log);
            _trackPV.call(this.monitor);
        }
    }
}


