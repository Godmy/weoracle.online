<script lang="ts">
	import { ThemeProvider } from 'stylist-svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>WeOracle</title>
</svelte:head>

<ThemeProvider theme-mode="light">
	{@render children()}
</ThemeProvider>
