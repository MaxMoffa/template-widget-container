
export default class DataUtils {
    static getName(type){
        switch (type) {
            case "aqi":
                return "AQI"
            case "pm1":
                return "PM 1";
            case "pm2_5":
                return "PM 2.5";
            case "pm10":
                return "PM 10";
            case "no2":
                return "NO2";
            case "voc":
                return "VOC";
            case "co":
                return "CO";
            case "so2":
                return "SO2";
            case "h2s":
                return "H2S";
            case "o3":
                return "O3";
            default:
                return type;
        }
    }

    static getId(type){
        switch (type) {
            case "AQI":
                return "aqi"
            case "PM 1":
                return "pm1";
            case "PM 2.5":
                return "pm2_5";
            case "PM 10":
                return "pm10";
            case "NO2":
                return "no2";
            case "VOC":
                return "voc";
            case "CO":
                return "co";
            case "SO2":
                return "so2";
            case "H2S":
                return "h2s";
            case "O3":
                return "o3";
            default:
                return type;
        }
    }

    static getUnitMeasure(type, fallback="ug / m3"){
        switch (type) {
            case "aqi":
                return "%";
            case "direzione_vento":
                return "";
            case "intensita_vento":
                return "m/s";
            default:
                return fallback;
        }
    }

    static getLimits(type){
        switch (type) {
            case "aqi":
                return {
                    max: 80,
                    middle: 50
                };
            case "pm1":
                return {
                    max:  10,
                    middle: 5,
                };
            case "pm2_5":
                return {
                    max: 25,
                    middle: 10
                };
            case "pm10":
                return {
                    max: 50,
                    middle: 20
                };
            case "no2":
                return {
                    max: 200,
                    middle: 150
                };
            case "voc":
                return {
                    max: 50,
                    middle: 25
                };
            case "co":
                return {
                    max: 10,
                    middle: 5
                };
            case "so2":
                return {
                    max: 350,
                    middle: 280
                };
            case "h2s":
                return {
                    max: 120,
                    middle: 60
                };
            case "o3":
                return {
                    max: 240,
                    middle: 180
                };
            default:
                return type;
        }
    }

    static getTypes(){
        return [
            "aqi",
            "pm1",
            "pm2_5",
            "pm10",
            "voc",
            "no2",
            "co",
            "o3",
            "so2",
            "h2s"
        ];
    }

    static getTypeColor(type){
        switch (type) {
            case "aqi":
                return "#f44336";
            case "pm1":
                return "#e91e63";
            case "pm2_5":
                return "#9c27b0";
            case "pm10":
                return "#673ab7";
            case "no2":
                return "#3f51b5";
            case "voc":
                return "#2196f3";
            case "co":
                return "#607d8b";
            case "so2":
                return "#ff5722";
            case "h2s":
                return "#795548";
            case "o3":
                return "#009688";
            default:
                return "#607d8b";
        }
    }

    static getDescription(type) {
        switch (type) {
            case "aqi":
                return "Gli inquinanti considerati nell'indice della qualità dell´aria sono quelli che hanno effetti a breve termine, ovvero il biossido di azoto (NO2) ed il particolato (PM10 o PM2.5 )";
            case "pm1":
                return "Polveri sospese con diametro medio di particella minore di 1µm";
            case "pm2_5":
                return "Polveri sospese con diametro medio di particella minore di 2.5µm";
            case "pm10":
                return "Polveri sospese con diametro medio di particella minore di 10µm";
            case "no2":
                return "Biossido di azoto";
            case "voc":
                return "Il VOC è indicativo della presenza di gas organici volatili";
            case "co":
                return "È una molecola formata da un atomo di carbonio ed uno di ossigeno, è un gas velenoso particolarmente insidioso in quanto inodore e insapore. Il monossido di carbonio viene prodotto da reazioni di combustione in difetto di aria";
            case "so2":
                return null;
            case "h2s":
                return null;
            case "o3":
                return "È una molecola formata da tre atomi di ossigeno, ha un caratteristico odore agliaceo. È un inquinante secondario, ovvero prodotto per decomposizione di altre molecole, è molto velenoso se respirato a grandi dosi";
            default:
                return "#607d8b";
        }
    }

    static getNote(type){
        switch (type) {
            case "aqi":
                return "All'aumentare della percentuale dell'Aqi la salubrità dell'aria diminuisce";
            case "pm1":
                return "La presenza di queste polveri sospese costituisce un serio problema sanitario, poichè riescono ad eludere la maggior parte delle barriere biologiche dell'apparato respiratorio";
            case "pm2_5":
                return "Il valore medio annuale di 25 µg/m³ non può essere superato nell'arco dell'anno";
            case "pm10":
                return "Il valore giornaliero di 50 µg/m³ non può essere superato più di 35 volte nell'arco dell'anno";
            case "no2":
                return "Il valore orario di 200 µg/m³ non può essere superato più di 18 volte nell'arco dell'anno";
            case "voc":
                return "Benzene, Toluene, Fenolo, etc.";
            case "co":
                return "Il valore massimo della media mobile calcolata sulle 8 ore non può superare i 10 mg/m³";
            case "so2":
                return null;
            case "h2s":
                return null;
            case "o3":
                return "Il valore massimo della media mobile calcolata sulle 8 ore non può superare i 10 mg/m³";
            default:
                return "#607d8b";
        }
    }
}