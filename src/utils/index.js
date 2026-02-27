export function createPageUrl(pageName) {
    return '/' + pageName.replace(/ /g, '-').toLowerCase();
}

/** Returns today's date as YYYY-MM-DD in the user's local timezone */
export function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
