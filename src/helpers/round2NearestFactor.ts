function round2NearestFactor(input: number, factor: number): number {
    return Math.ceil(input / factor) * factor;
}

export { round2NearestFactor };