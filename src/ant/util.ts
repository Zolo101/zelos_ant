/**
 * Converts a hex color string to RGB values
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns RGB values as [r, g, b] array, or null if invalid
 */
export function hexToRgb(hex: string): [number, number, number] | null {
    // Remove # if present
    const cleanHex = hex.replace(/^#/, "");

    // Check if it's a valid 6-digit hex
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        return null;
    }

    // Parse the hex values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return [r, g, b];
}

/**
 * Converts RGB values to a hex color string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string (e.g., "#ff0000")
 */
export function rgbToHex(r: number, g: number, b: number): string {
    // Clamp values to valid range
    const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

    const red = clamp(r);
    const green = clamp(g);
    const blue = clamp(b);

    // Convert to hex and pad with zeros if needed
    const toHex = (value: number) => value.toString(16).padStart(2, "0");

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}
