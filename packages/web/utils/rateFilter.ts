export function rateFilter(rate: number): boolean {
    const random = Math.random();
    return random < rate;
}