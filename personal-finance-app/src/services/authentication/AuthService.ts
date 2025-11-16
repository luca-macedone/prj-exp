/**
 * AuthService - Autenticazione minimalista con privacy massima
 * - Dati sensibili salvati SOLO localmente
 * - Server riceve solo hash (email hash, password hash)
 * - Biometria per unlock quotidiano
 * - PIN locale come fallback
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import SecureDatabase from '../storage/SecureDatabase';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  userId?: string;
  sessionToken?: string;
  error?: string;
}

class AuthService {
  private sessionToken: string | null = null;

  /**
   * Registra un nuovo utente con approccio privacy-first
   * Il server riceve SOLO hash, mai dati in chiaro
   */
  async registerUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Genera UUID anonimo per l'utente
      const userId = uuidv4();

      // Hash email per privacy (one-way, non reversibile)
      const emailHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        email.toLowerCase().trim()
      );

      // Hash password con salt random
      const passwordHash = await this.hashPassword(password);

      // Salva credenziali localmente (email in chiaro solo locale)
      await SecureStore.setItemAsync('user_id', userId);
      await SecureStore.setItemAsync('user_email', email);
      await SecureStore.setItemAsync('password_hash', passwordHash);

      // In produzione, qui invieresti i dati al server
      // Il server riceve SOLO hash, mai plaintext
      /*
      const response = await fetch('https://api.app.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          emailHash,
          passwordHash,
          deviceInfo: {
            platform: Platform.OS,
            // Nessun dato identificativo personale
          }
        })
      });

      const data = await response.json();
      this.sessionToken = data.sessionToken;
      await SecureStore.setItemAsync('session_token', data.sessionToken);
      */

      // Per demo locale, genera session token
      this.sessionToken = uuidv4();
      await SecureStore.setItemAsync('session_token', this.sessionToken);

      // Inizializza database locale per nuovo utente
      await this.initializeLocalDatabase(userId);

      return {
        success: true,
        userId,
        sessionToken: this.sessionToken
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login utente - verifica locale
   */
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Recupera dati salvati localmente
      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedPasswordHash = await SecureStore.getItemAsync('password_hash');

      if (!storedEmail || !storedPasswordHash) {
        return {
          success: false,
          error: 'User not found. Please register first.'
        };
      }

      // Verifica email
      if (storedEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Verifica password
      const passwordHash = await this.hashPassword(password);
      if (passwordHash !== storedPasswordHash) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Recupera session token
      const userId = await SecureStore.getItemAsync('user_id');
      this.sessionToken = await SecureStore.getItemAsync('session_token');

      return {
        success: true,
        userId: userId || undefined,
        sessionToken: this.sessionToken || undefined
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Hash password con SHA-256
   * NOTA: In produzione usare Argon2 o scrypt (più sicuri di SHA-256)
   */
  private async hashPassword(password: string): Promise<string> {
    // Aggiungi salt (in produzione usa un salt random per utente)
    const salt = 'finance-app-salt-2024'; // In prod: genera e salva salt random
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt
    );
  }

  /**
   * Unlock app con biometria (Face ID, Touch ID, Fingerprint)
   */
  async unlockWithBiometrics(): Promise<AuthResponse> {
    try {
      // Verifica hardware biometrico disponibile
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          success: false,
          error: 'Biometric hardware not available'
        };
      }

      // Verifica che l'utente abbia configurato biometria
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return {
          success: false,
          error: 'No biometric credentials enrolled'
        };
      }

      // Autentica con biometria
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sblocca la tua app finanziaria',
        fallbackLabel: 'Usa PIN',
        cancelLabel: 'Annulla',
        disableDeviceFallback: false
      });

      if (result.success) {
        // Recupera session info
        const userId = await SecureStore.getItemAsync('user_id');
        this.sessionToken = await SecureStore.getItemAsync('session_token');

        return {
          success: true,
          userId: userId || undefined,
          sessionToken: this.sessionToken || undefined
        };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric unlock failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unlock failed'
      };
    }
  }

  /**
   * Imposta PIN locale per unlock veloce
   * Il PIN è verificato SOLO localmente, mai inviato al server
   */
  async setPIN(pin: string): Promise<boolean> {
    try {
      // Valida PIN (deve essere 4-6 cifre)
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error('PIN must be 4-6 digits');
      }

      // Hash PIN prima di salvarlo
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );

      // Salva nel secure storage
      await SecureStore.setItemAsync('pin_hash', pinHash);

      return true;
    } catch (error) {
      console.error('Failed to set PIN:', error);
      return false;
    }
  }

  /**
   * Verifica PIN locale
   */
  async verifyPIN(pin: string): Promise<AuthResponse> {
    try {
      const storedPINHash = await SecureStore.getItemAsync('pin_hash');

      if (!storedPINHash) {
        return {
          success: false,
          error: 'No PIN set'
        };
      }

      // Hash del PIN inserito
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );

      // Verifica hash
      if (pinHash !== storedPINHash) {
        return {
          success: false,
          error: 'Invalid PIN'
        };
      }

      // PIN corretto
      const userId = await SecureStore.getItemAsync('user_id');
      this.sessionToken = await SecureStore.getItemAsync('session_token');

      return {
        success: true,
        userId: userId || undefined,
        sessionToken: this.sessionToken || undefined
      };
    } catch (error) {
      console.error('PIN verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Verifica se l'utente è già registrato
   */
  async isUserRegistered(): Promise<boolean> {
    const userId = await SecureStore.getItemAsync('user_id');
    return userId !== null;
  }

  /**
   * Verifica se l'utente ha una sessione attiva
   */
  async hasActiveSession(): Promise<boolean> {
    const sessionToken = await SecureStore.getItemAsync('session_token');
    return sessionToken !== null;
  }

  /**
   * Logout - rimuove session token
   */
  async logout(): Promise<void> {
    this.sessionToken = null;
    await SecureStore.deleteItemAsync('session_token');
  }

  /**
   * Elimina account - GDPR right to erasure
   */
  async deleteAccount(): Promise<void> {
    // Elimina tutti i dati dal database locale
    await SecureDatabase.deleteAllData();

    // Elimina tutte le credenziali
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_email');
    await SecureStore.deleteItemAsync('password_hash');
    await SecureStore.deleteItemAsync('session_token');
    await SecureStore.deleteItemAsync('pin_hash');

    // In produzione, notifica il server per cancellare i metadati
    /*
    await fetch('https://api.app.com/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`
      }
    });
    */

    this.sessionToken = null;
    console.log('Account deleted completely');
  }

  /**
   * Inizializza database locale per nuovo utente
   */
  private async initializeLocalDatabase(userId: string): Promise<void> {
    try {
      await SecureDatabase.initialize();
      console.log(`Database initialized for user ${userId}`);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Ottiene lo userId corrente
   */
  async getCurrentUserId(): Promise<string | null> {
    return await SecureStore.getItemAsync('user_id');
  }
}

// Singleton instance
export default new AuthService();
