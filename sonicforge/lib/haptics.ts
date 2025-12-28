/**
 * Triggers haptic feedback on supported devices.
 * Uses the Vibration API.
 */
export const triggerHaptic = (pattern: 'success' | 'error' | 'click' | 'light' | 'heavy' | 'rise') => {
    // Check if browser supports vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch(pattern) {
            case 'success': 
                // Two quick pulses
                navigator.vibrate([10, 30, 10, 30]); 
                break;
            case 'error': 
                // Three heavy pulses
                navigator.vibrate([50, 50, 50, 50, 50]); 
                break;
            case 'click': 
                // Very short tick
                navigator.vibrate(5); 
                break;
            case 'light': 
                // Almost imperceptible
                navigator.vibrate(2); 
                break;
            case 'heavy':
                // Single heavy thud
                navigator.vibrate(30);
                break;
            case 'rise':
                // Increasing intensity pattern (simulated)
                navigator.vibrate([5, 10, 10, 10, 20]);
                break;
        }
    }
};