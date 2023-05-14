// TODO: 这里关于 threshold 还有问题 ~~
import { Sender } from "sniper-core/Sender"
import WebMonitor from "../core/WebMonitor";
export class BeaconSender<Report> implements Sender<WebMonitor>{
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

