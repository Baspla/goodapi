export function validateUrl(url: string): boolean{
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export function validateTitle(title: string): boolean {
    return title.length > 0 && title.length < 256;
}