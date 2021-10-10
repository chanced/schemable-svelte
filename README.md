# schemable-svelte

Svelte action that sets the class of an element based reactively on the media
feature `prefers-color-scheme` or a provided preference.

-   No dependencies beyond svelte
-   SSR ready, packaged with svelte kit

```bash
pnpm add -D schemable-svelte
# npm install -D schemable-svelte
# yarn add -D schemable-svelte
```

## Usage

```html
<script>
	import { schemable } from "schemable-svelte";
</script>

<svelte:window use:schemable />
```

Upon first initialization, scheamble creates a store which fetches the value of
`prefers-color-scheme` and sets it in context. The store wires up event
listeners for changes to the media query. If preference is not provided, the
value of `prefers-color-scheme` is used to lookup the class to assign to the
`Element` with the action (likely `<svelte:body>`).

If a value for preference is passed to the option, it is considered an override
and promoted to the new value. `preference` can either be a `string` or a
readable store.

If the value of `preference` is a `string`, a new store is created that persists
the value to localstorage.

The media query store is available as `mediaSchemeStore`. If the `localStorage`
variant is utilized, it is avaiable as`schemePreferenceStore`.

### Options

| Option          | Description                                                                                            |
| :-------------- | :----------------------------------------------------------------------------------------------------- |
| `preference`    | Overrides `prefers-color-scheme`. This can either be a value or a readable store.                      |
| `defaultScheme` | Default value to utilize if `prefers-color-scheme` does not have a value and `preferences` is not set. |
| `dark`          | class to use for dark schemes. Defaults to `"dark"`                                                    |
| `light`         | class to use for light schemes. Defaults to `"light"`                                                  |

### Events

| Event                        | Description                                                                                                             |         `detail` |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------- | ---------------: |
| `"preferscolorschemechange"` | the value of `prefers-color-scheme` has changed.                                                                        |         `string` |
| `"colorschemechange"`        | the color scheme has changed, either through the provided `preference` or from the media feature `prefers-color-scheme` | `string \| null` |

## Contributing

Pull requests are always welcome.

## License

[MIT](https://choosealicense.com/licenses/mit/)
