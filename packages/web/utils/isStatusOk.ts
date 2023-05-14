export function isStatusOk(status: number) {
    return !(status >= 400 && status < 600)
}