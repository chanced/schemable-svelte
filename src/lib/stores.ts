import { writable } from "svelte/store";
import type { Writable, Readable, Updater } from "svelte/store";
import { getContext, setContext } from "svelte";

export type Scheme = "light" | "dark";

// const schemeKey = {};
const mediaStoreKey = {};
const preferenceKey = {};

const LOCAL_STORAGE_KEY = "__scheme__";

const darkQuery = "(prefers-color-scheme: dark)";
const lightQuery = "(prefers-color-scheme: light)";

export interface LocalStorageSchemeStore extends Writable<string | unknown> {
	// eslint-disable-next-line @typescript-eslint/ban-types
	"~ls": {};
}

export type MediaSchemeStore = Readable<Scheme | null>;

export type SchemePreferencesStore = Readable<string | null | undefined> | Readable<unknown>;

export type SchemeStore = Readable<string | null>;

function mediaMatches(scheme: Scheme): boolean {
	if (scheme === "dark") {
		return window.matchMedia(darkQuery).matches;
	}
	return window.matchMedia(lightQuery).matches;
}

function init(defaultScheme: Scheme | null = null): Scheme | null {
	if (typeof window === "undefined") {
		return defaultScheme;
	}
	if (mediaMatches("dark")) {
		return "dark";
	}
	if (mediaMatches("light")) {
		return "light";
	}
	return defaultScheme;
}

function createMediaSchemeStore(defaultScheme?: Scheme | null): MediaSchemeStore {
	const initial = init(defaultScheme);
	const { subscribe } = writable(initial, (set) => {
		if (initial === null) {
			return;
		}
		function handleMediaChange(ev: MediaQueryListEvent) {
			if (ev.matches) {
				set("dark");
			} else if (mediaMatches("light")) {
				set("light");
				console.log("setting to light");
			}
		}
		if (typeof window === "undefined") {
			return;
		}

		const darkMatcher = window.matchMedia(darkQuery);
		darkMatcher.addEventListener("change", handleMediaChange);
		return () => {
			darkMatcher.removeEventListener("change", handleMediaChange);
		};
	});

	setContext(mediaStoreKey, { subscribe });
	return { subscribe };
}

export function mediaSchemeStore(defaultScheme?: Scheme | null): MediaSchemeStore {
	return getContext<MediaSchemeStore>(mediaStoreKey) ?? createMediaSchemeStore(defaultScheme);
}
/**
 * localstorageSchemeStore persists the initial value to localstorage
 *
 * if the store exists, value is not utilized.
 *
 */
export function schemePreferenceStore(): LocalStorageSchemeStore {
	return getContext<LocalStorageSchemeStore>(preferenceKey) ?? createLocalStorageStore();
}

function createLocalStorageStore(): LocalStorageSchemeStore {
	const store = writable<string | null>(null, (set) => {
		if (typeof window === "undefined" || typeof localStorage === "undefined") {
			return;
		}
		set(localStorage.getItem(LOCAL_STORAGE_KEY));
	});

	return {
		"~ls": {},
		set(value: string | null | undefined) {
			store.set(value ?? null);
			if (value) {
				localStorage.setItem(LOCAL_STORAGE_KEY, value);
			} else {
				localStorage.removeItem(LOCAL_STORAGE_KEY);
			}
		},
		update(updater: Updater<string | null>) {
			let val: string | null = null;
			store.update((value) => {
				val = updater(value);
				return val;
			});
			if (val) {
				localStorage.setItem(LOCAL_STORAGE_KEY, val);
			} else {
				localStorage.removeItem(LOCAL_STORAGE_KEY);
			}
		},
		subscribe: store.subscribe,
	};
}
