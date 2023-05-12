import { Monitor } from "Monitor";
export interface Plugin<T extends Monitor = Monitor> {
    monitor: T;
    init?: Function;
    run: Function;
    unload?: Function;
    events?: Record<string, (payload: any) => void>
}