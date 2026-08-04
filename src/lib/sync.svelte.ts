import { browser } from "$app/environment";

export default function sync<T extends object>(key: string, initialValue: T) {
    let value = initialValue;

    if (browser) {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue !== null) value = JSON.parse(storedValue) as T;
        } catch (err) {
            console.error(`Failed to load localStorage value for "${key}"`, err);
        }
    }

    const state = $state(structuredClone(value));

    $effect(() => {
        if (!browser) return;
        try {
            localStorage.setItem(key, JSON.stringify($state.snapshot(state)));
        } catch (err) {
            console.error(`Failed to save localStorage value for "${key}"`, err);
        }
    });

    return state;
}
