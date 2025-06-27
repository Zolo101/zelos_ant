import { browser } from "$app/environment";

export default function sync<T>(key: string, initialValue: T) {
    let value = initialValue;
    if (browser) {
        const item = localStorage.getItem(key);
        if (item) {
            value = JSON.parse(item);
        }
    }

    const state = $state(value);

    $effect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    });

    return state;
}
