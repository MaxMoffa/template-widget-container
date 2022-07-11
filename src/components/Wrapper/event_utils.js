// Dispatcher
let _dispatch = null;
let _formData = null;

// Set dispatcher
export function setDispatch(dispatch=null){
    _dispatch = dispatch;
}

// Set form data
export function setFormData(formData=null){
    _formData = formData;
}

// Reset all
export function resetEventHandler(){
    _dispatch = null;
    _formData = null;
}

// Send message to the wrapper
function send_message(title, options={}) {

    if(!_dispatch)
        return;

    _dispatch("message", {
        title,
        ...options
    })
}

// Wrapper actions
export function showResult() {
    console.log("SHOW RESULT");
    send_message("showResult");
}

export function showError(text="") {
    send_message("showError", {
        text
    });
}

export function showConfirm(text) {
    send_message("showConfirm", {
        text
    });
}

export function showMaintenance(text, priority=false) {
    send_message("showMaintenance", {
        text,
        priority
    });
}

export function showLoading(text) {
    send_message("showLoading", {
        text
    });
}

export function showProgressBar(text, value=0) {
    send_message("showProgressBar", {
        text,
        value
    });
}

export function updateProgressBar(text, value=0) { 
    send_message("showProgressBar", {
        text,
        value
    });
}

// Update widget state
export function saveState(state, reload=true) {
    send_message("saveState", {
        state,
        reload
    });
}

// Show options 
export function showOptions_() {
    send_message("showOptions_");
}

// Open widget configurator
export function openOptions() {
    send_message("openOptions");
}

// Get form data object
export function getFormData() {

    let p = new FormData();

    if(!_formData || typeof(_formData) !== "object")
        return p;

    for(const [key, val] of Object.entries(_formData))
        p.append(key, val);

    return p;

}

// Load the dictionary for the widget
async function loadDictionary(id, lang) {
    try {

        // Import index
        let index = (await import(`../../widgets/${id}/lang/index.json`)).default;

        // Select dictionary
        if(index.includes(lang))
            return (await import(`../../widgets/${id}/lang/${lang}.json`)).default;

        // Fallback language
        if(index.length > 0)
            return (await import(`../../widgets/${id}/lang/${index[0]}.json`)).default;

        return null;

    } catch (error) {

        // console.log(error);
        return null;

    }
}

// Create dictionary object for the widget
export async function getDictionary(id, lang) {

    try {

        const dict = await loadDictionary(id, lang);

        const { default: LangUtils } = await import("../../utils/lang_utils");
    
        if(dict && typeof(dict) === "object")
            return new LangUtils(lang, dict);

        return new LangUtils(lang, {});
        
    } catch (error) {

        return null;
        
    }

}