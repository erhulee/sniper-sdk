import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import { MemoryLogger } from "web/logger"
type MemoryRecord = {
    jsHeapSizeLimit: number // 上下文内可用堆的最大体积
    totalJSHeapSize: number // 已分配的堆体积
    usedJSHeapSize: number  // 当前 JS 堆活跃段（segment）的体积
}
export class MemoryPlugin implements Plugin {
    monitor: WebMonitor
    has_memory: boolean
    timer: number | null
    waring_use_percent = 0.8
    constructor(monitor: WebMonitor) {
        this.monitor = monitor
        this.has_memory = false;
        this.timer = null;
    }
    init() {
        if ((performance as any).memory != null) {
            this.has_memory = true
        }
    }
    run() {
        if (!this.has_memory) return;
        this.timer = setInterval(() => {
            const memory: MemoryRecord = (performance as any).memory;
            const percent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            if (percent > this.waring_use_percent) {
                const logger = new MemoryLogger(percent, memory)
                this.monitor.send(logger)
            }
        }, 1000)
    }
    unload() {
        this.timer && clearInterval(this.timer)
    }
}

