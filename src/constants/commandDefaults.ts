interface IRollDefaults {
    amount: number;
    sides: number;
    maxDice: number;
};

const rollDefaults: IRollDefaults = {
    amount: 1,
    sides: 100,
    maxDice: 50
}

export { rollDefaults };
