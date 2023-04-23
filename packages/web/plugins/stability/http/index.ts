import WebMonitor from "web/core/WebMonitor"
import { Plugin } from "sniper-core"
import { HTTPPerformanceLogger, HTTPErrorLogger } from "web/logger/index";

function isStatusOk(status: number) {
    return !(status >= 400 && status < 600)
}
export class HTTPPlugin implements Plugin {
    monitor: WebMonitor;
    nativeXHRSend?: any
    nativeFetch?: any
    constructor(monitor: WebMonitor) {
        this.monitor = monitor
    }
    init() { }
    run() {
        const instance = this
        /* xhr 劫持 */
        this.nativeXHRSend = XMLHttpRequest.prototype.send;
        this.monitor.nativeXHRSend = this.nativeXHRSend
        XMLHttpRequest.prototype.send = function (...arg) {
            let self = this;
            const startTime = Date.now();
            self.addEventListener("readystatechange", function () {
                const url = this.responseURL;
                if (this.readyState == 4 && !isStatusOk(this.status)) {
                    // 报错
                    const code = this.status
                    const logger = new HTTPErrorLogger(code, url)
                    instance.monitor.send(logger)
                } else {
                    // 测速
                    const duration = Date.now().valueOf() - startTime.valueOf();
                    const logger = new HTTPPerformanceLogger(duration, url)
                    instance.monitor.send(logger)
                }
            })
            instance.nativeXHRSend.apply(self, arg)
        }

        /*  fetch 劫持 */
        if (!window.fetch) return;
        this.nativeFetch = fetch.bind(window);
        const that = this;
        window.fetch = function (...arg) {
            const promise = that.nativeFetch(...arg);
            const startTime = Date.now();
            promise.then((response: Response) => {
                if (response.ok) {
                    // 测速
                    const duration = Date.now().valueOf() - startTime.valueOf();
                    const url = response.url;
                    const logger = new HTTPPerformanceLogger(duration, url);
                    that.monitor.send(logger);
                } else {
                    //TODO 观察怎么拿到需要的信息
                    const url = response.url;
                    const statusCode = response.status;
                    const logger = new HTTPErrorLogger(statusCode, url);
                    that.monitor.send(logger)
                }
            }, (error: any) => {
                // 似乎不会出错
                console.log("error:", error)
            })
            return promise;
        }
    }
    unload() {
        XMLHttpRequest.prototype.send = this.nativeXHRSend
        window.fetch = this.nativeFetch
    }
}