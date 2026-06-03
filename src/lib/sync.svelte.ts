import { browser } from "$app/environment";
import { get, set } from "idb-keyval";

function replaceState<T extends object>(state: T, value: T) {
    if (Array.isArray(state) && Array.isArray(value)) {
        state.splice(0, state.length, ...value);
        return;
    }

    if (!Array.isArray(state) && !Array.isArray(value)) {
        const stateRecord = state as Record<string, unknown>;
        const valueRecord = value as Record<string, unknown>;

        for (const key of Object.keys(stateRecord)) {
            if (!(key in valueRecord)) {
                delete stateRecord[key];
            }
        }

        Object.assign(stateRecord, valueRecord);
    }
}

export default function sync<T extends object>(key: string, initialValue: T) {
    const state = $state(structuredClone(initialValue));
    let hydrated = $state(!browser);

    async function hydrate() {
        try {
            let value = (await get<T>(key)) as T | undefined;

            if (value === undefined) {
                const legacyValue = localStorage.getItem(key);
                if (legacyValue) {
                    value = JSON.parse(legacyValue) as T;
                    await set(key, value);
                }
            }

            if (value !== undefined) {
                replaceState(state, value);
            }
        } catch (err) {
            console.error(`Failed to load IndexedDB value for "${key}"`, err);
        } finally {
            hydrated = true;
        }
    }

    if (browser) {
        hydrate();
    }

    $effect(() => {
        if (!hydrated) return;

        set(key, $state.snapshot(state)).catch((err) => {
            console.error(`Failed to save IndexedDB value for "${key}"`, err);
        });
    });

    return state;
}
