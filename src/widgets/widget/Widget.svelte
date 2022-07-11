<script>

    /* NON MODIFICARE -> INIZIO */ 
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import StateManager from '../../components/Wrapper/StateManager';
    export let state, formData;    
    const dispatch = createEventDispatcher();
    const stateManager = new StateManager(dispatch, formData);
    /* NON MODIFICARE -> FINE */ 

    import { Button } from 'svelte-materialify/src';

    let dict = null;

    onMount(async () => {
        dict = await StateManager.getDictionary();
        console.log(dict);
        stateManager.showResult();
    });

    onDestroy(() => {
        stateManager.destroy();
    });

</script>

<main>

    {#if dict}

        <!-- ESEMPIO FUNZIONAMENTO ->  INIZIO -->
    
        <Button on:click={() => stateManager.showError("Esempio di errore")}>
            {dict.getString("showError")}
        </Button>
    
        <Button class="primary title-text" on:click={() => stateManager.showMaintenance("Esempio di manutenzione")}>
            {dict.getString("showMaintenance")}
        </Button>
    
        <Button class="secondary secondary-title-text" on:click={() => stateManager.showLoading("Esempio di caricamento")}>
            {dict.getString("showGeneralLoading")}
        </Button>
    
        <Button class="accent description-text" on:click={() => stateManager.showProgressBar("Esempio di caricamento con barra", 75)}>
            {dict.getString("showLoadingBar")}
        </Button>
    
        <!-- ESEMPIO FUNZIONAMENTO ->  FINE -->
        
    {/if}
    
</main>