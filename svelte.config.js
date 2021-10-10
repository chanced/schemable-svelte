import preprocess from "svelte-preprocess";
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [preprocess()],
	kit: {
		files: {
			template: "src/schemable.html",
		},
	},
};

export default config;
