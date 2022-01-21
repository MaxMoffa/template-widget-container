<script>
    import moment from 'moment';
    import { Row, Col, Ripple, Button } from 'svelte-materialify/src';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let value = null;
    export let date = false;
    export let time = false;
    export let datetime = false;
    export let label = null;
    export let disabled = false;
    export let now = true;
    export let acceptString = false;

    if(datetime && (date || time)){
        date = false;
        time = false;
    }

    let _date = getDate();
    let _time = getTime();
    let _datetime = getDateTime();

    let hasDateValue = false;
    let hasTimeValue = false;
    let hasDatetimeValue = false;

    let nowSelected = false;

    const update = (e) => {
        if(value)
        nowSelected = false;
        hasDateValue = Boolean(_date);
        hasTimeValue = Boolean(_time);
        hasDatetimeValue = Boolean(_datetime);

        if(date && time){
            if(hasDateValue && hasTimeValue) {
                let v = new Date(_date);
                let t = _time.split(":");
                v.setHours(t[0], t[1]);
                value = v;
            }else {
                value = null
            }
        }else if(date) {
            if(hasDateValue)
                value = new Date(_date);
            else 
                value = null;
        }else if(time) {
            if(hasTimeValue)
                value = _time;
            else
                value = null;
        }else if(datetime) {
            if(hasDatetimeValue)
                value = _datetime;
            else
                value = null;
        }

        dispatch("change", value);
    } 

    function getDate(v=value) {
        if(!v)
            return "";
        if(v === "today")
            return moment().format("YYYY-MM-DD");
        return moment(v).format("YYYY-MM-DD");
    }

    function getDateTime(v=value) {
        if(!v)
            return "";
        if(v === "today")
            return moment().format("YYYY-MM-DDTHH:mm");
        return moment(v).format("YYYY-MM-DDTHH:mm");
    }

    function getTime(v=value) {
        if(!v)
            return "";
        if(v === "today")
            return moment().format("HH:mm");
        return moment(v).format("HH:mm");
    }

    function setNow() {
        nowSelected = true;
        let d = new Date();
        if(acceptString)
            value = "today";
        else
            value = d;
        _date = getDate(d);
        _time = getTime(d);
        _datetime = getDateTime(d);
        hasDateValue = Boolean(_date);
        hasTimeValue = Boolean(_time);
        hasDatetimeValue = Boolean(_datetime);
        dispatch("change", value);
    }

</script>

{#if label}
    <div class="text-caption pb-2 pl-1">
        {label}
    </div>
{/if}

<div class="selectorContent rounded-t grey lighten-3 grey-text text-lighten-1" use:Ripple>
    <Row style="height: 100%" class="ma-0 pa-0">
        {#if date}
            <Col class="ma-0 pa-0">
                <input disabled={disabled} type="date" class="pl-2 pt-4 pb-4 pr-2 mb-0 grey-text text-darken-1" bind:value={_date} on:change={update} hasValue={hasDateValue} />
            </Col>
        {/if}
        {#if time}
            <Col class="ma-0 pa-0" cols={date ? 3 : undefined}>
                <input disabled={disabled} type="time" class="pl-2 pt-4 pb-4 pr-2 mb-0 text-center grey-text text-darken-1" bind:value={_time} on:change={update} hasValue={hasTimeValue} />
            </Col>
        {/if}
        {#if datetime}
            <Col class="ma-0 pa-0">
                <input disabled={disabled} type="datetime-local" class="pl-2 pt-4 pb-4 pr-2 mb-0 grey-text text-darken-1" bind:value={_datetime} on:change={update} hasValue={hasDatetimeValue} />
            </Col>
        {/if}
        {#if now && !nowSelected}
            <Col cols={"auto"} class="ma-0 pa-0 primary-color-text">
                <div class="selector pa-2" style="width: 100%; height: 100%; display: grid; place-items: center">
                    <Button {disabled} outlined depressed on:click={setNow}>
                        {time || datetime ? "Ora" : "Oggi"}
                    </Button>
                </div>
            </Col>
        {/if}
    </Row>
</div>

<style>

    .selectorContent {
        height: 64px;
    }

    input, .selector {
        width: 100%;
        height: 100% !important;
        outline: 0;
        border: 0;
        border-color: var(--theme-text-fields-border);
        border-style: solid;
        border-width: 0 0 thin 0;
        transition: 0.3s ease color;
    }

    input:focus {
        color: #000 !important;
    }

    input[hasValue = true] {
        color: #000 !important;
    }

</style>