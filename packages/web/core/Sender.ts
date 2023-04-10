import WebMonitor from "./WebMonitor";
import { Sender } from "share/Sender"
function isStatusOk(status: number) {
    return !(status >= 400 && status < 600)
}
const KEY = "__Web_Monitor_List__"
class BeaconSender<Report> implements Sender<WebMonitor>{
    endpoint: string;
    instance: WebMonitor;
    method: "post" = "post";
    constructor(endpoint: string, instance: WebMonitor) {
        this.endpoint = endpoint;
        this.instance = instance;
    }
    post(data: Report): void {
        window.navigator.sendBeacon(this.endpoint, JSON.stringify(data));
    }
}

class XHRSender<Report extends { appid: string }> implements Sender<WebMonitor>{
    endpoint: string;
    instance: WebMonitor;
    method: "post" | "get";

    cache: Report[];
    origin_threshold: number
    threshold: number
    constructor(endpoint: string,
        instance: WebMonitor,
        method: "post" | "get",
        threshold: number = 1
    ) {
        this.endpoint = endpoint;
        this.instance = instance;
        this.method = method;
        this.threshold = threshold;
        this.origin_threshold = threshold;
        this.cache = []
    }
    private real_post(): Promise<any> {
        const that = this;
        const data = this.cache;
        const body = {
            appid: this.instance.appid,
            logger: data
        }
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(that.method, that.endpoint);
            xhr.setRequestHeader("Content-Type", 'application/json');
            this.instance.nativeXHRSend?.call(xhr, JSON.stringify(body))
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState == 4) {
                    if (isStatusOk(this.status)) {
                        if (that.threshold !== that.origin_threshold) that.threshold /= 2;
                        that.cache = [];
                        localStorage.removeItem(KEY)
                    } else {
                        that.threshold *= 2;
                        localStorage.setItem(KEY, JSON.stringify(that.cache));
                    }
                    resolve(this.response)
                }
            })
        })

        return promise
    }

    post(data: Report): Promise<any> {
        this.cache.push(data);
        if (this.cache.length < this.threshold) {
            localStorage.setItem(KEY, JSON.stringify(this.cache))
            return Promise.resolve("cache success");
        } else {
            return this.real_post();
        }
    }
}

export {
    BeaconSender,
    XHRSender
}