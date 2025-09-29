/**
 * Servicio para manejar la configuración de emails
 */

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

export class EmailConfigService {
  private static readonly CONFIG_KEY = 'email-config';
  
  /**
   * Obtiene la configuración de email actual
   */
  static getConfig(): EmailConfig {
    const defaultConfig: EmailConfig = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@cotizador.com',
      fromName: 'BLS Cotizador',
      enabled: false
    };

    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    }

    return defaultConfig;
  }

  /**
   * Guarda la configuración de email
   */
  static saveConfig(config: Partial<EmailConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving email config:', error);
    }
  }

  /**
   * Verifica si el email está configurado correctamente
   */
  static isConfigured(): boolean {
    const config = this.getConfig();
    return config.enabled && 
           config.smtpHost && 
           config.smtpUser && 
           config.fromEmail;
  }

  /**
   * Obtiene el email de destino para recordatorios
   */
  static getDestinationEmail(): string {
    // Por ahora retornamos un email por defecto
    // En el futuro esto debería venir del usuario actual logueado
    return 'russofg@gmail.com'; // Cambiar por el email del usuario actual
  }
}
