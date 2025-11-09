
export const getInitials = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const generateHslColorFromString = (str: string, saturation: number = 70, lightness: number = 40): string => {
    if (!str) return `hsl(0, ${saturation}%, ${lightness}%)`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
