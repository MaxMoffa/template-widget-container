<script>

    import { ProgressCircular, ProgressLinear, Icon, Button } from 'svelte-materialify/src';
	import { mdiAlertBox, mdiHammerWrench, mdiCog, mdiCheckBold } from '@mdi/js';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import IntersectionObserver from "svelte-intersection-observer";
	import { createBoundary } from '@crownframework/svelte-error-boundary';
	import LangUtils from '../utils/lang_utils';
	import ErrorWrapper from './CustomBoundary.svelte';
	import { theme, getBackground, getColor } from '../store/theme';
	import { blur } from 'svelte/transition';

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Event dispatcher
	const dispatch = createEventDispatcher();

	// Custom error wrapper
	const Boundary = createBoundary(ErrorWrapper);

    // Props
	export let token = null;
	export let apikey = null;
	export let state = null;
	export let showContextualOptions = true;
	export let disableContextMenu = false;
	export let widgetId = null;
	export let lang = "en";

	//TODO: Capire quali di questi servono o meno
	export let widget;
	export let properties;
    export let showOptions = true;
	export let padding = 0;
    export let sessionID = null;
	export let parent = null;

	// Intersection Observer Visibility
	let isWidgetVisible = false;

	// Reload widget
	let reload = false;

	// Main ref widget
	let MAIN_REF;

	// Maintenance priority
	let maintenancePriority = false;

	// Generic container configuration
	let genericContainer = {
		showCircleLoading: true,
		text: "Caricamento in corso",
	};

	// Widget dictionary
	let dict = false;

	// Auto refresh interval
	let _interval = null;

	// Load the widget dictionary on mount
	onMount(async () => {

		// Load dictionary
		if(widgetId)
			dict = await loadDictionary(widgetId, lang);
		else
			dict = true;

	});

	// Clear the interval when the widget get removed
	onDestroy(() => {
		if(_interval)
			clearInterval(_interval);
		unsubscribeTheme();
	});

	// Load the dictionary for the widget
	async function loadDictionary(id, lang) {
		try {

			// Import index
			let index = (await import(`../widgets/${id}/lang/index.json`)).default;

			// Select dictionary
			if(index.includes(lang))
				return (await import(`../widgets/${id}/lang/${lang}.json`)).default;

			// Fallback language
			if(index.length > 0)
				return (await import(`../widgets/${id}/lang/${index[0]}.json`)).default;

			return true;

		} catch (error) {

			// console.log(error);
			return true;

		}
	}

	// Create dictionary object for the widget
	function getDictionary() {
		if(typeof(dict) === "object")
			return new LangUtils(lang, dict);
		return new LangUtils(lang, {});
	}

	// Wrapper actions
	function showResult() {
		if(maintenancePriority)
			return;
		genericContainer = null;
	}

	function showError(text="") {
		if(maintenancePriority)
			return;
		genericContainer = {
			icon: mdiAlertBox,
			text: text,
			showReload: true,
			showConfig: true
		}
	}

	function showConfirm(text) {
		if(maintenancePriority)
			return;
		genericContainer = {
			icon: mdiCheckBold,
			text: text,
			showReload: true
		}
	}

	function showMaintenance(text, priority=false) {
		if(maintenancePriority)
			return;
		maintenancePriority = priority;
 		genericContainer = {
			icon: mdiHammerWrench,
			text: text,
			showReload: true,
			showConfig: true
		}
	}

	function showLoading(text) {
		if(maintenancePriority)
			return;
		genericContainer = {
			showCircleLoading: true,
			text: text,
		}
	}

	function showProgressBar(text, value=0) {
		if(maintenancePriority)
			return;
		genericContainer = {
			showProgressBar: true,
			progressBarValue: value,
			text: text
		}
	}

	// Prepare the form data object for the widget
	function getFormData() {
		let params = new FormData();
		if(token)
			params.append("token", token);
		else if(apikey)
			params.append("apikey", apikey);
		return params
	}

	// Update widget state
	function saveState(state, reload=true) {
		dispatch("saveState", state);
		if(reload)
			reloadWidget();
	}

	// Retrieve widget state
	function getState() {

		// Check if need setup
		let needSetup = false;
		if(state && typeof(state) === "object")
			Object.keys(state).forEach(key => {
				if(state[key] === null)
					needSetup = true;
				if(state[key] && typeof(state[key]) === "object")
					if(state[key].hasOwnProperty("value") && state[key].value === null)
						needSetup = true; 
			});
		if(needSetup){
			showMaintenance("Il widget richiede un setup", true);
			return state;
		}

		// Load timer refresh
		if(state && _interval === null && state.hasOwnProperty("_timer_refresh") && typeof(state._timer_refresh) === "number" && state._timer_refresh > 0)
			reloadEvery(state._timer_refresh).then(() => console.log("INTERVAL REMOVED"));

		return state;
	}

	// Reload the widget
	function reloadWidget() {
		showLoading();
		reload = true;
		maintenancePriority = false;
		setTimeout(() => {
			reload = false;
		}, 100);
	}

	//TODO: Eliminare questo metodo
	function showOptions_() {
		return;
		// if(!showOptions)
		// 	return;
		// showOptionsBtn = true;
		// if(!state){
		// 	dispatch("changeOptions", {
		// 		widget: widget,
		// 		state: null
		// 	})
		// }
	}

	// Open widget configurator
	function openOptions() {
		if(showContextualOptions){
			dispatch("changeOptions", {
				widget: widget,
				state: state
			});
		}
	}

	// Auto refresh handler
	function reloadEvery(millis) {
		return new Promise((resolve, reject) => {
			_interval = setInterval(() => {
			if(sessionID !== null && sessionID !== window._gridSessionID){
				console.log("Remove interval...");
				clearInterval(_interval);
				_interval = null;
				resolve();
			}
			reloadWidget();
		}, millis);
		});
	}

	// Dispatch contextmenu
	function contextmenu(e) {
		if(disableContextMenu)
			e.preventDefault();
		dispatch("contextmenu", {e, ref: MAIN_REF});
	}

	// Get theme to use with the widget
	function _getTheme(theme) {
		if(properties.DARK_MODE_SUPPORTED)
			return `theme--${theme}`;
		return "theme--light";
	}

	// Get colors to use with the widget
	function _getColor(theme) {
		if(properties.DARK_MODE_SUPPORTED){
			return {
				background: properties.THEME[theme],
				text: properties.TEXT_COLOR[theme],
				background_dashboard: getBackground(theme),
				color_dashboard: getColor(theme),
				theme
			}
		}
		return {
			background: properties.THEME["light"],
			text: properties.TEXT_COLOR["light"],
			background_dashboard: getBackground("light"),
			color_dashboard: getColor("light"),
			theme: "light"
		}
	}

</script>

<IntersectionObserver once element={MAIN_REF} root={parent} bind:intersecting={isWidgetVisible}>

	{#if widget && properties}

		<!-- Main -->
		<main 
			bind:this={MAIN_REF}
			class="{_getTheme(_theme)} pa-{padding}"
			style="background: {_getColor(_theme).background}"
			on:contextmenu={contextmenu}
		>

			<!-- Widget content -->
			<div class="content-widget">
				<Boundary onError={showError}>
					
					<!-- Widget -->
					<div>
						{#if isWidgetVisible && !reload && dict}
						
							<svelte:component
								this={widget} 
								WIDGET_VISIBLE={genericContainer === null}
								{showResult}
								{showConfirm}
								{showError}
								{showMaintenance}
								{showLoading}
								{showProgressBar}
								updateProgressBar={showProgressBar}
								{getFormData}
								state={getState()}
								{saveState}
								{showOptions_}
								{openOptions}
								{getDictionary}
								color={_getColor(_theme)}
								on:changeOptions={() => {
									if(showContextualOptions){
										dispatch("changeOptions", {
											widget: widget,
											state: state
										});
									}
								}}
								on:changeChildOptions={(e) => {
									dispatch("changeChildOptions", e.detail);
								}}
							/>
						
						{/if}
					</div>

				</Boundary>
			</div>

			<!-- Generic container -->
			{#if genericContainer}
				<div class="generic-container" style="background: {_getColor(_theme).background}" transition:blur="{{amount: 10}}">

					<!-- Content generic container -->
					<div class="content">

						<!-- Icon -->
						{#if genericContainer.hasOwnProperty("icon") && genericContainer.icon}
							<div class="icon">
								<Icon path={genericContainer.icon} size={64} />
							</div>
						{/if}

						<!-- Circle loading -->
						{#if genericContainer.hasOwnProperty("showCircleLoading") && genericContainer.showCircleLoading}
							<div class="icon">
								<ProgressCircular size={64} indeterminate color={"primary-color"} />
							</div>
						{/if}

						<!-- Circle loading -->
						{#if genericContainer.hasOwnProperty("showProgressBar") && genericContainer.showProgressBar && genericContainer.hasOwnProperty("progressBarValue")}
							<div class="icon">
								<ProgressLinear rounded height={"20px"} value={genericContainer.progressBarValue} color={"primary-color"}>
									<span class="white-text font-weight-bold">
										{genericContainer.progressBarValue}%
									</span>
								</ProgressLinear>
							</div>
						{/if}

						<!-- Text description -->
						{#if genericContainer.hasOwnProperty("text") && genericContainer.text}
							<div class="text">
								{genericContainer.text}
							</div>
						{/if}

						<!-- Action buttons -->
						{#if (genericContainer.hasOwnProperty("showReload")  && genericContainer.showReload) || (genericContainer.hasOwnProperty("showConfig")  && genericContainer.showConfig)}
							<div class="action">
								<div>
									{#if genericContainer.hasOwnProperty("showReload")  && genericContainer.showReload}
										<div>
											<Button class="primary-color white-text" block depressed size="small" on:click={reloadWidget}>
												Ricarica
											</Button>
										</div>
									{/if}
									<div>
										{#if genericContainer.hasOwnProperty("showConfig")  && genericContainer.showConfig && state}
											<Button class="primary-text" outlined block depressed size="small" on:click={() => {
												dispatch("changeOptions", {
													widget: widget,
													state: state
												});
											}}>
												Configura
											</Button>
										{/if}
									</div>
								</div>
							</div>
						{/if}

					</div>

				</div>
			{/if}

		</main>

	{/if}

</IntersectionObserver>

<style>

	/* Main */
	main {
		width: 100%;
        height: 100%;
		overflow: hidden;
	}

	/* Widget space */
	.content-widget {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
	}

	/* Generic container */
	.generic-container {
		position: relative;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		display: grid;
		place-items: center;
		user-select: none;
	}

	.generic-container > .content {
		width: 100%;
		max-width: 300px;
		height: auto;
	}

	.generic-container > .content > div {
		display: grid;
		place-items: center;
	}

	.generic-container > .content > .text {
		padding-top: 32px;
	}

	.generic-container > .content > .action {
		padding-top: 32px;
	}

</style>