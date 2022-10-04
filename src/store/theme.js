import { writable } from 'svelte/store';

export const THEME_PREFERENCE = "theme-preference";

// Get user preference
let _theme = localStorage.getItem(THEME_PREFERENCE) || "light";
_theme = _theme !== "light" && _theme !== "dark" ? "light" : _theme;

// Theme store
export const theme = writable(_theme);

// Set theme value
export const setTheme = _theme => {
    theme.set(_theme);
    localStorage.setItem(THEME_PREFERENCE, _theme);
}

// Toogle theme value
export const toogleTheme = () => {
    theme.update(val => {
        let _newTheme;
        if(val === "light")
            _newTheme = "dark"
        else
            _newTheme = "light";

        localStorage.setItem(THEME_PREFERENCE, _theme);

        return _newTheme;
    });
}

export const getBackground = (theme="light") => {
    if(theme === "light")
        return "grey lighten-3";
    return "grey darken-3";
}

export const getColor = (theme="light") => {
    if(theme === "light")
        return "white";
    return "black";
}

export const getBackgroundInverted = (theme="light") => {
    if(theme === "light")
        return "grey darken-3";
    return "grey lighten-3";
}

export const getColorInverted = (theme="light") => {
    if(theme === "light")
        return "black";
    return "white";
}