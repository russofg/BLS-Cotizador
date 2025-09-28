// Theme management utility
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: 'blue', // Default Tailwind blue
  fontSize: 'medium'
};

export const predefinedColors = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0', 
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe', 
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171', 
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  }
};

export const fontSizes = {
  small: {
    base: '14px',
    scale: '0.875'
  },
  medium: {
    base: '16px', 
    scale: '1'
  },
  large: {
    base: '18px',
    scale: '1.125'
  }
};

export class ThemeManager {
  private currentTheme: ThemeConfig = defaultTheme;
  private listeners: ((theme: ThemeConfig) => void)[] = [];

  constructor() {
    this.loadTheme();
    this.setupMediaQuery();
  }

  // Load theme from localStorage and Firestore
  async loadTheme(): Promise<void> {
    try {
      // First try localStorage for instant loading
      const stored = localStorage.getItem('user-theme');
      if (stored) {
        this.currentTheme = { ...defaultTheme, ...JSON.parse(stored) };
        this.applyTheme();
      }

      // Then try to load from Firestore for sync across devices
      // This will be implemented when we integrate with user profile
    } catch (error) {
      console.warn('Error loading theme:', error);
    }
  }

  // Save theme to localStorage and Firestore
  async saveTheme(theme: Partial<ThemeConfig>): Promise<void> {
    this.currentTheme = { ...this.currentTheme, ...theme };
    
    try {
      // Save to localStorage immediately
      localStorage.setItem('user-theme', JSON.stringify(this.currentTheme));
      
      // Apply theme
      this.applyTheme();
      
      // Notify listeners
      this.listeners.forEach(callback => callback(this.currentTheme));
      
      // TODO: Save to Firestore for cross-device sync
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // Apply theme to DOM
  private applyTheme(): void {
    const root = document.documentElement;
    const body = document.body;

    // Apply dark/light mode
    if (this.currentTheme.mode === 'dark') {
      root.classList.add('dark');
    } else if (this.currentTheme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply primary color
    const colors = predefinedColors[this.currentTheme.primaryColor as keyof typeof predefinedColors];
    if (colors) {
      Object.entries(colors).forEach(([shade, value]) => {
        root.style.setProperty(`--color-primary-${shade}`, value);
      });
    }

    // Apply font size
    const fontSize = fontSizes[this.currentTheme.fontSize];
    root.style.setProperty('--font-size-base', fontSize.base);
    root.style.setProperty('--font-scale', fontSize.scale);
    
    // Apply font scale to body
    body.style.fontSize = fontSize.base;
  }

  // Setup system color scheme detection
  private setupMediaQuery(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme.mode === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  // Get current theme
  getTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  // Subscribe to theme changes
  subscribe(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Quick theme methods
  setMode(mode: ThemeConfig['mode']): Promise<void> {
    return this.saveTheme({ mode });
  }

  setPrimaryColor(color: string): Promise<void> {
    return this.saveTheme({ primaryColor: color });
  }

  setFontSize(fontSize: ThemeConfig['fontSize']): Promise<void> {
    return this.saveTheme({ fontSize });
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();

// Utility functions for components
export function getCurrentTheme(): ThemeConfig {
  return themeManager.getTheme();
}

export function subscribeToTheme(callback: (theme: ThemeConfig) => void): () => void {
  return themeManager.subscribe(callback);
}
