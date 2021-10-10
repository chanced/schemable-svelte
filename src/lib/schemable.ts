import { writable, derived } from "svelte/store";
import type { Unsubscriber, Readable } from "svelte/store";
import { schemePreferenceStore, mediaSchemeStore } from "./stores";
import type {
	Scheme,
	SchemeStore,
	SchemePreferencesStore as SchemePreferenceStore,
} from "./stores";
import type { LocalStorageSchemeStore } from "src";

const DEFAULT_DARK_CLASS = "dark";
const DEFAULT_LIGHT_CLASS = "light";

interface Classes {
	dark: string;
	light: string;
}

export interface SchemableOptions {
	preference?: string | Readable<string> | Readable<unknown> | null;
	defaultScheme?: Scheme;
	dark?: string;
	light?: string;
}
export interface SchemableAction {
	update(opts: SchemableOptions): void;
	destroy(): void;
}
function getClasses({ light, dark }: Partial<Classes>): Classes {
	return {
		light: light ?? DEFAULT_LIGHT_CLASS,
		dark: dark ?? DEFAULT_DARK_CLASS,
	};
}

/**
 * assigns the users preferred scheme from either media queries or assignment
 *
 * @fires CustomEvent#preferscolorschemechanged
 * @fires CustomEvent#colorschemechange
 */
export function schemable(node: HTMLElement, opts: SchemableOptions = {}): SchemableAction {
	const unsub: {
		scheme?: Unsubscriber | null;
		media?: Unsubscriber | null;
	} = {};
	let prevMediaDefault: string | undefined;

	const stores: {
		preference?: Readable<unknown> | LocalStorageSchemeStore;
		scheme?: SchemeStore;
	} = {};
	const { dark, light } = getClasses(opts);
	const classes = writable({ dark, light });

	function monitor(prefStore: SchemePreferenceStore): Unsubscriber {
		const prevClasses: Classes = { dark, light };
		let prevUnknown: string | undefined;
		let assigned: string;
		console.log("starting monitor");
		return derived([prefStore, classes], ([preference, classes]) => {
			return {
				preference,
				classes,
			};
		}).subscribe(({ preference, classes }) => {
			console.log({ preference });
			const { classList } = node;
			[
				[prevClasses.dark, classes.dark],
				[prevClasses.light, classes.light],
			]
				.filter(([prev, updated]) => prev !== updated && classList.contains(prev))
				.forEach(([prev, updated]) => {
					{
						classList.remove(prev);
						classList.add(updated);
					}
				});

			if (typeof preference === "string" && prevUnknown && preference !== prevUnknown) {
				node.classList.remove(prevUnknown);
				dispatchColorSchemeChange(light);
				prevUnknown = undefined;
			}
			if (preference === dark) {
				node.classList.add(dark);
				dispatchColorSchemeChange(dark);
				assigned = dark;
			} else {
				node.classList.remove(dark);
			}
			if (preference === light) {
				node.classList.add(light);
				dispatchColorSchemeChange(light);
			} else {
				node.classList.remove(light);
			}

			return () => {
				console.log("shutting down monitor");
				if (assigned) {
					node.classList.remove(assigned);
				}
			};
		});
	}
	function dispatchColorSchemeChange(name: string | null) {
		/**
		 * Color scheme changed event.
		 *
		 * @event CustomEvent#preferscolorschemechange
		 * @type {object}
		 * @property {string} detail - The new prefers-color-scheme media preference
		 */
		node.dispatchEvent(new CustomEvent("colorschemechange", { detail: name }));
	}
	function getPreferenceStore(
		preference: string | null | Readable<unknown> | Readable<string> | undefined,
	): SchemePreferenceStore | LocalStorageSchemeStore {
		if (typeof preference === "string" || preference === null || preference === undefined) {
			const prefStore = stores.preference;
			if (!prefStore) {
				const lsStore = schemePreferenceStore();
				return lsStore;
			} else {
				return prefStore;
			}
		} else if (stores.preference !== preference) {
			return preference;
		}
		return stores.preference;
	}

	function update(opts: SchemableOptions = {}) {
		const { preference } = opts;
		classes.set(getClasses(opts));

		if (prevMediaDefault !== opts.defaultScheme) {
			if (unsub.media) {
				unsub.media();
				unsub.media = null;
			}
		}
		if (!unsub.media) {
			unsub.media = mediaSchemeStore(opts.defaultScheme).subscribe((value) => {
				console.log("media changed");
				node.dispatchEvent(new CustomEvent("preferscolorschemechange", { detail: value }));
			});
		}

		const prefStore = getPreferenceStore(preference);

		if ("~ls" in prefStore) {
			if (!stores.preference && preference) {
				console.log(`saving "${preference}" to localstorage`);
				prefStore.set(preference);
			} else if (stores.preference) {
				console.log(`saving "${preference}" to localstorage`);
				prefStore.set(preference);
			}
		}
		if (prefStore !== stores.preference) {
			console.log("prefStore !== stores.preference");
			if (unsub.scheme) {
				unsub.scheme();
				unsub.scheme = null;
			}
			stores.preference = prefStore;
			stores.scheme = derived(
				[stores.preference, mediaSchemeStore(opts.defaultScheme)],
				([preference, media]) => {
					if (preference && typeof preference === "string" && preference.length) {
						return preference;
					}
					return media;
				},
			);

			unsub.scheme = monitor(stores.scheme);
		}
	}

	function destroy() {
		if (unsub.media) {
			unsub.media();
		}
		if (unsub.scheme) {
			unsub.scheme;
		}
	}

	update(opts);

	return { update, destroy };
}
