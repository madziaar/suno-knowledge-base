// This database provides structured options for the AtmosphereDesigner component.

export const ATMOSPHERIC_TEXTURES = [
    'Warm', 'Cold', 'Spacious', 'Intimate', 'Hazy', 'Crisp', 'Muffled', 'Clear',
    'Gritty', 'Smooth', 'Organic', 'Synthetic', 'Lo-Fi', 'Hi-Fi', 'Vintage', 'Modern',
    'Ethereal', 'Grounded', 'Dreamy', 'Nighttime'
];

export const SFX_CATEGORIES: Record<string, string[]> = {
    'Nature': ['Rain', 'Thunder', 'Wind', 'Ocean Waves', 'Birds Chirping', 'Crickets', 'Fire Crackling'],
    'Urban': ['City Ambience', 'Traffic', 'Police Siren', 'Subway Sounds', 'Crowd Murmur'],
    'Sci-Fi / Electronic': ['Synth Risers', 'Glitch Effects', 'Laser Zaps', 'Spaceship Hum', 'Computer Beeps', 'Static'],
    'Foley / Misc': ['Footsteps', 'Heartbeat', 'Clock Ticking', 'Vinyl Crackle', 'Tape Hiss', 'Camera Shutter', 'Keyboard Typing']
};