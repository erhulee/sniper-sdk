export function getCurrentTime() {
    return (performance || Date).now()
}