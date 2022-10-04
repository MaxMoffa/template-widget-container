<script>

    import { ProgressCircular, ProgressLinear, Icon, Button, Intersect } from 'svelte-materialify/src';
	import { mdiAlertBox, mdiHammerWrench, mdiCog, mdiCheckBold } from '@mdi/js';
	import { afterUpdate, createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { theme, getBackground, getColor } from '../../store/theme';

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Event dispatcher
	const dispatch = createEventDispatcher();

    // Props
	export let token = null;
	export let apikey = null;
	export let state = null;
	export let showContextualOptions = true;
	export let disableContextMenu = false;
	export let widgetId = null;
	export let lang = "en";
	export let disableSetup = false;
	export let widget;
	export let properties;
    export let showOptions = true;
	export let padding = 0;

    // Main reference
    let MAIN_REF;

    // Is widget visible
    let isWidgetVisible = false;

    // Last value
    let lastWidgetId = null;
    let lastState = null;

    // Widget loader
    async function loadWidget(widgetId, state) {

        

    }

</script>

<!-- Main -->
<main>

    <!-- Widget loader -->
    {#await loadWidget(widgetId, state)}
            
    {:then result} 
        
    {/await}   
    
</main>