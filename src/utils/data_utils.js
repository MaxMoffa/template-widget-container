
export default class DataUtils {
    static getName(type){
        switch (type) {
            case "aqi":
                return "AQI"
            case "risk":
                return "Risk";
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
            case "temperatura":
                return "Temperature";
            case "umidita":
                return "Humidity";
            default:
                return type;
        }
    }

    static getId(type){
        switch (type) {
            case "AQI":
                return "aqi";
            case "Risk":
                return "risk"
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
            case "Temperature":
                return "temperatura";
            case "Humidity":
                return "umidita";
            default:
                return type;
        }
    }

    static getUnitMeasure(type, fallback="ug / m3"){
        switch (type) {
            case "aqi":
                return "%";
            case "risk":
                return "%";
            case "direzione_vento":
                return "";
            case "intensita_vento":
                return "m/s";
            case "temperatura":
                return "°C";
            case "umidita":
                return "%";
            case "co":
                return "mg/m^3";
            default:
                return fallback;
        }
    }

    static getLimits(type){
        switch (type) {
            // 20, 50, 70, 90
            case "aqi":
                return {
                    max: 90,
                    high: 70,
                    middle: 50,
                    low: 20
                };
            case "risk":
                return {
                    max: 90,
                    high: 70,
                    middle: 50,
                    low: 20
                };
            // 2, 4, 6, 8
            case "pm1":
                return {
                    max:  8,
                    high: 6,
                    middle: 4,
                    low: 2
                };
            // 5, 15, 25, 35
            case "pm2_5":
                return {
                    max:  35,
                    high: 25,
                    middle: 15,
                    low: 5
                };
            // 10, 20, 30, 50
            case "pm10":
                return {
                    max:  50,
                    high: 30,
                    middle: 20,
                    low: 10
                };
            // 20, 60, 100, 200
            case "no2":
                return {
                    max:  200,
                    high: 100,
                    middle: 60,
                    low: 20
                };
            // 10, 20, 35, 50
            case "voc":
                return {
                    max:  50,
                    high: 35,
                    middle: 20,
                    low: 10
                };
            // 2, 4, 8, 10
            case "co":
                return {
                    max:  10,
                    high: 8,
                    middle: 4,
                    low: 2
                };
            // 50, 100, 200, 350
            case "so2":
                return {
                    max:  350,
                    high: 200,
                    middle: 100,
                    low: 50
                };
            // 30, 60, 90, 120
            case "h2s":
                return {
                    max:  120,
                    high: 90,
                    middle: 60,
                    low: 30
                };
            // 50, 80, 180, 240
            case "o3":
                return {
                    max:  240,
                    high: 180,
                    middle: 80,
                    low: 50
                };
            // 5, 15, 25, 40
            case "temperatura":
                return {
                    max:  40,
                    high: 25,
                    middle: 15,
                    low: 5
                };
            // 20, 40, 60, 80
            case "umidita":
                return {
                    max:  80,
                    high: 60,
                    middle: 40,
                    low: 20
                };
            default:
                return null;
        }
    }

    static getLegend(type) {
        switch (type) {        
            case "umidita":
                return ["#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b"];
            default:
                return ["#4caf50", "#8BC34A", "#FFEB3B", "#FFC107", "#F44336"];
        }
    }

    static getColorValue(type, value){
        let limits = this.getLimits(type);
        let legend = this.getLegend(type);
        let c1, c2, p;
        if(value < limits.low){
            c1 = this._hexToRgb(legend[0]);
            c2 = this._hexToRgb(legend[1]);
            p = (value * 100) / limits.low;
        }else if(value < limits.middle){
            c1 = this._hexToRgb(legend[1]);
            c2 = this._hexToRgb(legend[2]);
            p = ((value - limits.low) * 100) / (limits.middle - limits.low);
        }else if(value < limits.high){
            c1 = this._hexToRgb(legend[2]);
            c2 = this._hexToRgb(legend[3]);
            p = ((value - limits.middle) * 100) / (limits.high - limits.middle);
        }else if(value < limits.max){
            c1 = this._hexToRgb(legend[3]);
            c2 = this._hexToRgb(legend[4]);
            p = ((value - limits.high) * 100) / (limits.max - limits.high);
        }else{
            return legend[4];
        }
        let c = this.blend(c1, c2, p/100);
        return c;
    }

    static blend(from, to, p = 0.5) {
        const r = Math.round;
        const b = p < 0;
        p = b ? p * -1 : p;
        const f = from;
        const t = to;
        if (to[0] === 'r') {
            return 'rgb' + (to[3] === 'a' ? 'a(' : '(') +
                r(((t[0] - f[0]) * p) + f[0]) + ',' +
                r(((t[1] - f[1]) * p) + f[1]) + ',' +
                r(((t[2] - f[2]) * p) + f[2]) + (
                    f[3] < 0 && t[3] < 0 ? '' : ',' + (
                        f[3] > -1 && t[3] > -1
                            ? r((((t[3] - f[3]) * p) + f[3]) * 10000) / 10000
                            : t[3] < 0 ? f[3] : t[3]
                    )
                ) + ')';
        }
    
        return '#' + (0x100000000 + ((
            f[3] > -1 && t[3] > -1
                ? r((((t[3] - f[3]) * p) + f[3]) * 255)
                : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255
            ) * 0x1000000) +
            (r(((t[0] - f[0]) * p) + f[0]) * 0x10000) +
            (r(((t[1] - f[1]) * p) + f[1]) * 0x100) +
            r(((t[2] - f[2]) * p) + f[2])
        ).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
    }
    

    static _getColorValue(type, value){
        let limits = this.getLimits(type);
        let legend = this.getLegend(type);
        let c1, c2, p;
        if(value < limits.low){
            return legend[0];
        }else if(value < limits.middle){
            return legend[1];
        }else if(value < limits.high){
            return legend[2];
        }else if(value < limits.max){
            return legend[3];
        }else{
            return legend[4];
        }
        let c = this._pickHex(c1, c2, p/100);
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }

    static _hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });
      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
      }

    static _pickHex(color1, color2, weight) {
        var w1 = 1-weight;
        var w2 = w1;
        var rgb = [color1[0] * w1 + color2[0] * w2,
            color1[1] * w1 + color2[1] * w2,
            color1[2] * w1 + color2[2] * w2];
        return rgb;
    }

    static getTypes(filter=[]){
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
            "h2s",
            "temperatura",
            "umidita"
        ].filter(o => filter.length === 0 || o === "aqi" || filter.includes(o));
    }

    static getSources(filter=[]){
        return [
            {name: "Tutti", value: "all"}, 
            {name: "SSQ", value: "ssq"}, 
            {name: "Arpa", value: "ARPA"}, 
            {name: "Copernicus", value: "CP"},
            {name: "Smart Park Milano", value: "SMPA"}
        ].filter(o => filter.length === 0 || (filter.length === 1 && filter[0] === "all") || o.value === "prediction" || filter.includes(o.value));
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