<script>
	import { ProgressCircular, ProgressLinear, Icon, Button } from 'svelte-materialify/src';
	import { mdiAlertBox, mdiAccountHardHat, mdiCog, mdiCheckBold } from '@mdi/js';
	import { createEventDispatcher } from 'svelte';
	import IntersectionObserver from "svelte-intersection-observer";
	const dispatch = createEventDispatcher();

	export let token = null;
	export let apikey = null;
	export let state = null;
	export let showOptions = true;
	export let showContextualOptions = true;
	export let widget;
	export let sessionID = null;
	export let parent = null;

	// Status options
	const LOADING = 0, DONE = 1, ERROR = -1, MAINTENANCE = 2, CONFIRM = 3;

	// Loading options
	const GENERIC_LOADING = 0, PROGRESSBAR_LOADING = 1;

	// Reload
	let reload = false;
	let _interval = null;
	let isVisible = false;

	let showOptionsBtn = false;

	let MAIN_REF;

	// Status widget
	let STATUS_WIDGET = LOADING;
	let TEXT_DESCRIPTION = "";
	let LOADING_TYPE = GENERIC_LOADING;
	let LOADING_VALUE = 0;
	let maintenancePriority = false;


	function showResult() {
		if(maintenancePriority)
			return;
		STATUS_WIDGET = DONE;
		LOADING_VALUE = 0;
		TEXT_DESCRIPTION = "";
	}

	function showError(text) {
		if(maintenancePriority)
			return;
		STATUS_WIDGET = ERROR;
		LOADING_VALUE = 0;
		TEXT_DESCRIPTION = text;
	}

	function showConfirm(text) {
		if(maintenancePriority)
			return;
		STATUS_WIDGET = CONFIRM;
		LOADING_VALUE = 0;
		TEXT_DESCRIPTION = text;
	}

	function showMaintenance(text, priority=false) {
		if(priority)
			maintenancePriority = true;
		STATUS_WIDGET = MAINTENANCE;
		LOADING_VALUE = 0;
		TEXT_DESCRIPTION = text;
	}

	function showLoading(text) {
		if(maintenancePriority)
			return;
		STATUS_WIDGET = LOADING;
		LOADING_TYPE = GENERIC_LOADING;
		LOADING_VALUE = 0;
		TEXT_DESCRIPTION = text;
	}

	function showProgressBar(text, value=0) {
		if(maintenancePriority)
			return;
		STATUS_WIDGET = LOADING;
		LOADING_TYPE = PROGRESSBAR_LOADING;
		TEXT_DESCRIPTION = text;
		LOADING_VALUE = value;
	}

	function updateProgressBar(text, value=0) {
		if(maintenancePriority)
			return;
		if(STATUS_WIDGET === LOADING && LOADING_TYPE === PROGRESSBAR_LOADING){
			TEXT_DESCRIPTION = text;
			LOADING_VALUE = value;
		}
	}

	function getFormData() {
		let params = new FormData();
		if(token)
			params.append("token", token);
		else if(apikey)
			params.append("apikey", apikey);

		return params
	}

	function saveState(state, reload=true) {
		dispatch("saveState", state);
		if(reload)
			reloadWidget();
	}

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

	function reloadWidget() {
		isVisible = true;
		maintenancePriority = false;
		reload = true;
		setTimeout(() => reload = false, 0);
	}

	function showOptions_() {
		if(!showOptions)
			return;
		showOptionsBtn = true;
		if(!state){
			dispatch("changeOptions", {
				widget: widget,
				state: null
			})
		}
	}

	function openOptions() {
		if(showContextualOptions){
			dispatch("changeOptions", {
				widget: widget,
				state: state
			});
		}
	}

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

</script>

<IntersectionObserver once element={MAIN_REF} root={parent} bind:intersecting={isVisible}>

	<main bind:this={MAIN_REF}>

		{#if showOptionsBtn}
		
			<div class="btn-menu-options" on:click={() => dispatch("changeOptions", {
					widget: widget,
					state: state
				})
			}>

				<Icon 
					size="16"
					path={mdiCog} 
				/>

			</div>

		{/if}
		
		{#if !reload && isVisible}
			
			<svelte:component
				this={widget} 
				WIDGET_VISIBLE={STATUS_WIDGET === DONE}
				{showResult}
				{showConfirm}
				{showError}
				{showMaintenance}
				{showLoading}
				{showProgressBar}
				{updateProgressBar}
				{getFormData}
				state={getState()}
				{saveState}
				{showOptions_}
				{openOptions}
				on:changeOptions={() => {
					if(showContextualOptions){
						dispatch("changeOptions", {
							widget: widget,
							state: state
						});
					}
				}}
			/>

			{#if STATUS_WIDGET === LOADING}
			
				{#if LOADING_TYPE === GENERIC_LOADING}

					<div class="GENERIC_CONTAINER">

						<div>
							
							<div class="loading-element">
								<ProgressCircular 
									size={70} 
									indeterminate 
									color="success" 
								/>
							</div>

							<span>
								{TEXT_DESCRIPTION}
							</span>

							<div class="btn-reload">
								<Button size="small" on:click={reloadWidget}>
									Riavvia
								</Button>
							</div>

						</div>

					</div>

				{:else}

					<div class="GENERIC_CONTAINER">

						<div>
							<ProgressLinear 
								height="16px" 
								value={LOADING_VALUE} 
							/>

							<span>
								{TEXT_DESCRIPTION}
							</span>

							<div class="btn-reload">
								<Button size="small" on:click={reloadWidget}>
									Riavvia
								</Button>
							</div>

						</div>

					</div>

				{/if}

			{:else if STATUS_WIDGET === ERROR}
			
				<div class="GENERIC_CONTAINER">

					<div>
						<Icon 
							size="64"
							path={mdiAlertBox} 
						/>

						<span>
							{TEXT_DESCRIPTION}
						</span>

						<div class="btn-reload">
							<Button size="small" on:click={reloadWidget}>
								Riavvia
							</Button>

							{#if state && showContextualOptions}

								<Button style="margin-top: 6px" class="accent" size="small" on:click={() => {
									if(showContextualOptions){
										dispatch("changeOptions", {
											widget: widget,
											state: state
										});
									}
								}}>
									Opzioni
								</Button>

							{/if}

						</div>

					</div>

				</div>

			{:else if STATUS_WIDGET === CONFIRM}
			
				<div class="GENERIC_CONTAINER">

					<div>
						<Icon 
							size="64"
							path={mdiCheckBold} 
						/>

						<span>
							{TEXT_DESCRIPTION}
						</span>

						<div class="btn-reload">
							
							<Button size="small" on:click={reloadWidget}>
								Riavvia
							</Button>

						</div>

					</div>

				</div>
			
			{:else if STATUS_WIDGET === MAINTENANCE}

				<div class="GENERIC_CONTAINER">

					<div>
						<Icon 
							size="64"
							path={mdiAccountHardHat} 
						/>

						<span>
							{TEXT_DESCRIPTION}
						</span>

						<div class="btn-reload">
							<Button size="small" on:click={reloadWidget}>
								Riavvia
							</Button>

							{#if state && showContextualOptions}

								<Button style="margin-top: 6px" class="accent" size="small" on:click={() => {
									maintenancePriority = false;
									if(showContextualOptions){
										dispatch("changeOptions", {
											widget: widget,
											state: state
										});
									}
								}}>
									{maintenancePriority ? "Configura" : "Opzioni"}
								</Button>

							{/if}

						</div>

					</div>

				</div>

			{/if}

		{/if}

		{#if !isVisible}

			<div class="GENERIC_CONTAINER">

				<div>
					
					<div class="loading-element">
						<ProgressCircular 
							size={70} 
							indeterminate 
							color="success" 
						/>
					</div>

					<span>
						Il widget non è visibile					
					</span>

					<div class="btn-reload">
						<Button size="small" on:click={reloadWidget}>
							Avvia
						</Button>
					</div>

				</div>

			</div>

		{/if}
			
	</main>

</IntersectionObserver>

<style>

	:global(.s-app){
		width: 100%;
		height: 100%;
	}

	main {
		width: 100%;
        height: 100%;
	}

	.GENERIC_CONTAINER {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}

	.GENERIC_CONTAINER > div {
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
	}

	.GENERIC_CONTAINER > div > span {
		text-align: center;
		margin-top: 32px;
	}

	.GENERIC_CONTAINER > div > .loading-element {
		display: grid;
		place-items: center;
	}

	.btn-reload {
		width: 100%;
		padding: 16px 32px;
		display: grid;
		place-items: center;
	}

	.btn-menu-options {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: #fff;
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
		position: absolute;
		top: 16px;
		right: 16px;
		z-index: 1005;
		display: grid;
		place-items: center;
		cursor: pointer;
	}

</style>