<script lang="ts">
	import '../app.css';
	import { ThemeProvider } from 'stylist-svelte';

	let { data, children } = $props();

	$effect(() => {
		document.documentElement.lang = data.lang;
	});
</script>

<svelte:head>
	<title>WeOracle</title>
</svelte:head>

<ThemeProvider themeScheme="weoracle">
	{@render children()}
</ThemeProvider>
