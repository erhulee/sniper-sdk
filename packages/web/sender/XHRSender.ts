import { Sender } from "sniper-core/Sender"
import { WebMonitor } from "web/core";
import { isStatusOk } from "web/utils/isStatusOk";
const id_creator = confirmId();
const KEY = "__Web_Monitor_List__"
function* confirmId() {
    let i = 0;
    while (1) {
        yield i;
        i++
    }
}


type Report = any;
export class XHRSender implements Sender<WebMonitor>{
    endpoint: string;
    instance: WebMonitor;
    method: "post" | "get";
    cache: Report[];                 // 
    wait_queue: Report[];            // 等待服务端确认的队列
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
        // 和 localstorage 统一
        this.cache = [];
        this.wait_queue = []
    }

    // 只接受数组 <- 批量发送
    _post(data: Report[]) {
        // 内存级备份 -> 防止请求失败，会在下一次请求的时候，把原先失败的都带上
        this.cache.push(...data);
        // 磁盘级备份 -> 防止页面退出，下一次加载会读取这一部分重新上传
        // localStorage = 正在等待确认的数据 + 下一次发送需要携带的数据
        localStorage.setItem(KEY, JSON.stringify([...this.cache, ...this.wait_queue]))
        // 开始请求
        const body = {
            appid: this.instance.appid,
            logger: this.cache
        }
        const xhr = new XMLHttpRequest();
        xhr.open(this.method, this.endpoint);
        xhr.setRequestHeader("Content-Type", 'application/json');
        this.instance.nativeXHRSend?.call(xhr, JSON.stringify(body))
        // 等待确认已经成功送达
        const wait_confirm = new Set(this.cache.map(item => item.confirm_id));
        const wait_confirm_loggers = this.cache.map(item => item);
        // 全局等待队列在存一下
        this.wait_queue.push(...wait_confirm_loggers);

        // 假定已经发送成功, 缓存取消
        this.cache = this.cache.filter(item => !wait_confirm.has(item.confirm_id))
        const that = this
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState == 4) {
                if (isStatusOk(this.status)) {
                    // 请求成功: 把已经确认的数据，从等待确认的队列中删除
                    that.wait_queue = that.wait_queue.filter(item => !wait_confirm.has(item.confirm_id))
                } else {
                    // 请求失败: 把正在等待确认的数据，重新放回 cache
                    that.cache.push(...wait_confirm_loggers)
                }
            }
        })
    }


    post(data: Report | Report[]): any {
        // 给 logger 打上 id
        if (Array.isArray(data)) this._post(data.map(item => ({ ...item, confirm_id: id_creator.next() })));
        else this._post([{ ...data, confirm_id: id_creator.next() }])
    }
}

