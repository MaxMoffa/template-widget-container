
<script>
    /* NON MODIFICARE -> INIZIO */ 
    export let showResult, showError, showLoading, showMaintenance, showProgressBar, updateProgressBar, getFormData, saveState, state, showOptions_, getDictionary;
    export let WIDGET_VISIBLE = false;
    /* NON MODIFICARE -> FINE */ 

    let dict = getDictionary();

    /* ESEMPIO FUNZIONAMENTO ->  INIZIO */
    import { Button } from 'svelte-materialify/src';
    setTimeout(() => {
        showResult();
    });
    /* ESEMPIO FUNZIONAMENTO ->  FINE */

</script>

<main id="widget-container" style={WIDGET_VISIBLE ? "" : "display: none"}>


    <!-- ESEMPIO FUNZIONAMENTO ->  INIZIO -->
    <Button on:click={() => showError("Esempio di errore")}>
        {dict.getString("showError")}
    </Button>

    <Button class="primary title-text" on:click={() => showMaintenance("Esempio di manutenzione")}>
        {dict.getString("showMaintenance")}
    </Button>

    <Button class="secondary secondary-title-text" on:click={() => showLoading("Esempio di caricamento")}>
        {dict.getString("showGeneralLoading")}
    </Button>

    <Button class="accent description-text" on:click={() => showProgressBar("Esempio di caricamento con barra", 75)}>
        {dict.getString("showLoadingBar")}
    </Button>

    <!-- ESEMPIO FUNZIONAMENTO ->  FINE -->
    
</main>