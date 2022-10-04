
// Widget list
export const widgetsList = [
    {
        name: "Esempio",
        id: "widget_example",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Percorsi centraline",
        id: "widget_routes_centraline",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Classifiche",
        id: "widget_leaderboards",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Creazione progetto",
        id: "widget_creazione_progetto",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Report una tantum",
        id: "report_una_tantum",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Shop",
        id: "widget_shop",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Visualizzatore dati",
        id: "widget_data_chart",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Report",
        id: "widget_report_generator",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Visualizzatore dati",
        id: "widget_place_chart",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Geomap",
        id: "widget_geomap",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Geomap Lite",
        id: "widget_geomap_lite",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Widget Exporter",
        id: "widget_exporter",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Apikey generator",
        id: "widget_apikey_generator",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Valida report",
        id: "widget_valida_report",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Gestione centraline",
        id: "gestione_centraline",
        isAdmin: true,
        topics: [],
        category: null
    },
    {
        name: "Geomap risk",
        id: "widget_geomap_risk",
        isAdmin: false,
        topics: [],
        category: null
    },
    {
        name: "Download centraline",
        id: "download_centraline",
        isAdmin: true,
        topics: [],
        category: null
    }
];


// Widget default properties
const defaultProperties = {
    THEME : {
        light: "#fff",
        dark : "#000"
    },
    TEXT_COLOR: {
        light: "#000",
        dark : "#fff"
    },
    DARK_MODE_SUPPORTED: false
}
const getWidgetProperties = (propreties) => {
    return {
        ...defaultProperties,
        ...propreties
    }
}

// Get widget infos
export const getWidgetInfo = async (id) => {
    return {
        widget: (await import(`./${id}/Widget.svelte`)).default,
        propreties: getWidgetProperties(await import(`./${id}/Constants.js`)),
    };
};

// Get widget class
export const getWidget = async (id) => {
    return (await import(`./${id}/Widget.svelte`)).default;
};

// Get widget propreties
export const getPropreties = async (id) => {
    return getWidgetProperties(await import(`./${id}/Constants.js`));
};
