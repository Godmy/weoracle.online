<script lang="ts">
	let {
		href,
		size = '1.5rem',
		subtitle = false,
		ariaLabel = 'WeOracle Online',
		class: className = ''
	}: {
		href?: string;
		size?: string;
		subtitle?: boolean;
		ariaLabel?: string;
		class?: string;
	} = $props();
</script>

{#snippet content()}
	<img class="brand-logo__mark brand-logo__mark--light" src="/weoracle-mark-light.png" alt="" aria-hidden="true" />
	<img class="brand-logo__mark brand-logo__mark--dark" src="/weoracle-mark-dark.png" alt="" aria-hidden="true" />
	<span class="brand-logo__text">
		<span class="brand-logo__word">We<span class="brand-logo__accent">Oracle</span></span>
		{#if subtitle}
			<span class="brand-logo__subtitle">
				<span class="brand-logo__line"></span>
				Online
				<span class="brand-logo__line"></span>
			</span>
		{/if}
	</span>
{/snippet}

{#if href}
	<a {href} class="brand-logo {className}" style:--brand-logo-size={size} aria-label={ariaLabel}>
		{@render content()}
	</a>
{:else}
	<span class="brand-logo {className}" style:--brand-logo-size={size} aria-label={ariaLabel} role="img">
		{@render content()}
	</span>
{/if}

<style>
	.brand-logo {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-size: var(--brand-logo-size);
		text-decoration: none;
		color: var(--color-text-primary, #0f172a);
		line-height: 1;
	}
	.brand-logo__mark {
		display: block;
		width: 1em;
		height: 1em;
		flex: none;
	}
	.brand-logo__mark--light {
		display: none;
	}
	:global(html.light) .brand-logo__mark--dark {
		display: none;
	}
	:global(html.light) .brand-logo__mark--light {
		display: block;
	}
	.brand-logo__text {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}
	.brand-logo__word {
		font-size: 0.6em;
		font-weight: 800;
		letter-spacing: -0.01em;
	}
	.brand-logo__accent {
		color: var(--color-primary-500, #f97316);
	}
	.brand-logo__subtitle {
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.22em;
		font-weight: 700;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: var(--color-primary-500, #f97316);
	}
	.brand-logo__line {
		flex: 1;
		height: 1px;
		min-width: 1em;
		background: var(--color-border-primary, currentColor);
		opacity: 0.6;
	}
</style>
