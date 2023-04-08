import WebMonitor from "web/WebMonitor"
import { ResourceType } from "./type"
const UNKNOWN = "unknown"
// 父类仅仅作为收集环境
class BaseLogger {
    environments: {
        userAgent: string,
        dateTime: number,
        did: string,
        uid: string
        path: string
    }
    monitor: WebMonitor

    constructor() {
        this.monitor = window.__SNIPER__
        this.environments = {
            userAgent: navigator.userAgent,
            dateTime: Date.now().valueOf(),
            did: (window.__SNIPER__ as WebMonitor).fingerprint || UNKNOWN,
            uid: (window.__SNIPER__ as WebMonitor).uid || UNKNOWN,
            path: window.location.href
        }
    }
}

class StabilityBaseLogger extends BaseLogger {
    category = "stability"
}
class PerformanceBaseLogger extends BaseLogger {
    category = "performance"
}

export class JSErrorLogger extends StabilityBaseLogger {
    type: "JS" = "JS"
    message: string
    stack: string
    rrwebStack: any[]
    constructor(message: string, stack: string) {
        super();
        this.message = message
        this.stack = stack
        this.rrwebStack = this.monitor.rrwebStack ?? [];
    }
}

export class PromiseErrorLogger extends JSErrorLogger {
    constructor(message: string, stack: string) {
        super(message, stack);
    }
}

export class HTTPErrorLogger extends StabilityBaseLogger {
    type: "HTTP" = "HTTP"
    statusCode: number
    url: string
    constructor(statusCode: number, url: string) {
        super();
        this.statusCode = statusCode
        this.url = url
    }
}

export class ResourceErrorLogger extends StabilityBaseLogger {
    type: "Resource" = "Resource"
    resourceType: ResourceType
    src: string
    constructor(resourceType: ResourceType, src: string,) {
        super();
        this.resourceType = resourceType
        this.src = src
    }
}

export class HTTPPerformanceLogger extends PerformanceBaseLogger {
    type: "HTTP" = "HTTP"
    duration: number
    url: string
    constructor(duration: number, url: string) {
        super();
        this.duration = duration
        this.url = url
    }
}

export class ResourcePerformanceLogger extends PerformanceBaseLogger {
    type: "Resource" = "Resource"
    resourceType: ResourceType
    src: string
    duration: number
    constructor(resourceType: ResourceType, src: string, duration: number) {
        super();
        this.resourceType = resourceType
        this.src = src
        this.duration = duration
    }
}

