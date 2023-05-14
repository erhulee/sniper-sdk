export class LimitQueue<T> {
    private size: number
    private data: T[] = []
    constructor(size: number) {
        this.size = size;
    }

    add(data: T) {
        if (this.data.length > this.size) this.data.shift();
        this.data.push(data)
    }
    get value() {
        return this.data
    }
}