import { Sender } from "sniper-core/Sender"
import WebMonitor from "../core/WebMonitor";
export class ImageSender<Report> implements Sender<WebMonitor>{
    endpoint: string;
    instance: WebMonitor;
    method: "post" = "post";
    constructor(endpoint: string, instance: WebMonitor) {
        this.endpoint = endpoint;
        this.instance = instance;
    }
    post(data: Report): void {
        const img = new Image(1, 1);
        img.onerror = ((event) => {
            console.log(event)
        })
        // TODO
        img.src = this.endpoint
    }
}

