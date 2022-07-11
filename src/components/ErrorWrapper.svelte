<script>

    import { createBoundary } from '@crownframework/svelte-error-boundary';
    import ErrorWrapper from './CustomBoundary.svelte';
    import { createEventDispatcher } from 'svelte';

    // Custom error wrapper
	const Boundary = createBoundary(ErrorWrapper);

    // Event dispatcher
    const dispatch = createEventDispatcher();

    export let widget = null;
    export let WIDGET_VISIBLE =  true;
	export let showResult;
	export let showConfirm;
    export let showError;
	export let showMaintenance;
	export let showLoading;
	export let showProgressBar;
	export let updateProgressBar;
	export let getFormData;
	export let saveState;
	export let showOptions_;
	export let openOptions;
	export let getDictionary;
	export let state;
	export let color;

</script>

<Boundary onError={(e) => {
    setTimeout(() => showError(e));
}}> 
    
    <svelte:component 
        this={widget}
        {WIDGET_VISIBLE}
        {showResult}
        {showConfirm}
        {showError}
        {showMaintenance}
        {showLoading}
        {showProgressBar}
        {updateProgressBar}
        {getFormData}
        {saveState}
        {showOptions_}
        {openOptions}
        {getDictionary}
        {state}
        {color}
        on:changeOptions={e => {
            dispatch("changeOptions");
        }}
        on:changeChildOptions={e => {
            dispatch("changeChildOptions", e.detail);
        }}
    />

</Boundary>

