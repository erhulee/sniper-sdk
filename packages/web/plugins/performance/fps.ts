
import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import { getCurrentTime } from "web/utils/currentDate"
import { rateFilter } from "web/utils/rateFilter"
import { FPSLogger } from "web/logger"
type Options = {
    // FPS 需要设置采样率，太高频了，默认设置 0.1% = 0.001
    rate: number
}
const defaultOptions = {
    rate: 0.001
}
export class FPSPlugin implements Plugin {
    monitor: WebMonitor
    frames_count: number
    pre_timestamp: number
    options: Options
    callback_id?: number
    constructor(monitor: WebMonitor, options: Options = defaultOptions) {
        this.monitor = monitor
        this.frames_count = 0
        this.options = options
        this.pre_timestamp = getCurrentTime();
    }
    run() {
        const callback = () => {
            const rate = this.options.rate || 0.001;
            this.frames_count++;
            const current = getCurrentTime();
            if (current >= this.pre_timestamp + 1000) {
                const fps = this.frames_count;
                this.frames_count = 0;
                this.pre_timestamp = current;
                if (rateFilter(rate)) {
                    this.monitor.send(new FPSLogger(fps))
                }
            } else {
                this.frames_count++;
            }
            this.callback_id = window.requestAnimationFrame(callback)
        }
        this.callback_id = window.requestAnimationFrame(callback)
    }
    unload() {
        this.callback_id && window.cancelAnimationFrame(this.callback_id)
    }
}


