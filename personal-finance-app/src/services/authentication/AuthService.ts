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

export interface UserInfo {
  userId: string;
  email: string;
}

class AuthService {
  private sessionToken: string | null = null;
  private USERS_LIST_KEY = 'users_list';

  /**
   * Ottiene la lista di tutti gli utenti registrati
   */
  async getAllUsers(): Promise<UserInfo[]> {
    try {
      const usersJson = await SecureStore.getItemAsync(this.USERS_LIST_KEY);
      if (!usersJson) {
        return [];
      }
      return JSON.parse(usersJson);
    } catch (error) {
      console.error('Failed to get users list:', error);
      return [];
    }
  }

  /**
   * Aggiunge un utente alla lista
   */
  private async addUserToList(userId: string, email: string): Promise<void> {
    const users = await this.getAllUsers();
    users.push({ userId, email });
    await SecureStore.setItemAsync(this.USERS_LIST_KEY, JSON.stringify(users));
  }

  /**
   * Rimuove un utente dalla lista
   */
  private async removeUserFromList(userId: string): Promise<void> {
    const users = await this.getAllUsers();
    const filteredUsers = users.filter(u => u.userId !== userId);
    await SecureStore.setItemAsync(this.USERS_LIST_KEY, JSON.stringify(filteredUsers));
  }

  /**
   * Controlla se un'email è già registrata
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const users = await this.getAllUsers();
    return users.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  /**
   * Trova userId per email
   */
  private async getUserIdByEmail(email: string): Promise<string | null> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    return user?.userId || null;
  }

  /**
   * Ottiene l'utente corrente
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    const currentUserId = await SecureStore.getItemAsync('current_user_id');
    if (!currentUserId) {
      return null;
    }
    const users = await this.getAllUsers();
    return users.find(u => u.userId === currentUserId) || null;
  }

  /**
   * Imposta l'utente corrente
   */
  private async setCurrentUser(userId: string): Promise<void> {
    await SecureStore.setItemAsync('current_user_id', userId);
  }

  /**
   * Registra un nuovo utente con approccio privacy-first
   * Il server riceve SOLO hash, mai dati in chiaro
   */
  async registerUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Controlla se l'email è già registrata
      const emailExists = await this.isEmailRegistered(email);
      if (emailExists) {
        return {
          success: false,
          error: 'Email already registered. Please login or use a different email.'
        };
      }

      // Genera UUID anonimo per l'utente
      const userId = uuidv4();

      // Hash email per privacy (one-way, non reversibile)
      const emailHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        email.toLowerCase().trim()
      );

      // Hash password con salt random
      const passwordHash = await this.hashPassword(password);

      // Salva credenziali con chiavi prefissate per userId
      await SecureStore.setItemAsync(`user_${userId}_email`, email);
      await SecureStore.setItemAsync(`user_${userId}_password_hash`, passwordHash);

      // Aggiungi utente alla lista
      await this.addUserToList(userId, email);

      // Imposta come utente corrente
      await this.setCurrentUser(userId);

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
      await SecureStore.setItemAsync(`user_${userId}_session_token`, data.sessionToken);
      */

      // Per demo locale, genera session token
      this.sessionToken = uuidv4();
      await SecureStore.setItemAsync(`user_${userId}_session_token`, this.sessionToken);

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
      // Trova userId per email
      const userId = await this.getUserIdByEmail(email);
      if (!userId) {
        return {
          success: false,
          error: 'User not found. Please register first.'
        };
      }

      // Recupera dati salvati per questo utente
      const storedEmail = await SecureStore.getItemAsync(`user_${userId}_email`);
      const storedPasswordHash = await SecureStore.getItemAsync(`user_${userId}_password_hash`);

      if (!storedEmail || !storedPasswordHash) {
        return {
          success: false,
          error: 'User data corrupted. Please contact support.'
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

      // Imposta come utente corrente
      await this.setCurrentUser(userId);

      // Recupera o genera session token
      this.sessionToken = await SecureStore.getItemAsync(`user_${userId}_session_token`);
      if (!this.sessionToken) {
        this.sessionToken = uuidv4();
        await SecureStore.setItemAsync(`user_${userId}_session_token`, this.sessionToken);
      }

      return {
        success: true,
        userId,
        sessionToken: this.sessionToken
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
      // Verifica che ci sia un utente corrente
      const currentUserId = await SecureStore.getItemAsync('current_user_id');
      if (!currentUserId) {
        return {
          success: false,
          error: 'No user selected. Please login first.'
        };
      }

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
        // Recupera session info per utente corrente
        this.sessionToken = await SecureStore.getItemAsync(`user_${currentUserId}_session_token`);

        return {
          success: true,
          userId: currentUserId,
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
      // Verifica che ci sia un utente corrente
      const currentUserId = await SecureStore.getItemAsync('current_user_id');
      if (!currentUserId) {
        throw new Error('No user logged in');
      }

      // Valida PIN (deve essere 4-6 cifre)
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error('PIN must be 4-6 digits');
      }

      // Hash PIN prima di salvarlo
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );

      // Salva nel secure storage con chiave prefissata
      await SecureStore.setItemAsync(`user_${currentUserId}_pin_hash`, pinHash);

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
      // Verifica che ci sia un utente corrente
      const currentUserId = await SecureStore.getItemAsync('current_user_id');
      if (!currentUserId) {
        return {
          success: false,
          error: 'No user selected. Please login first.'
        };
      }

      const storedPINHash = await SecureStore.getItemAsync(`user_${currentUserId}_pin_hash`);

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

      // PIN corretto - recupera session token
      this.sessionToken = await SecureStore.getItemAsync(`user_${currentUserId}_session_token`);

      return {
        success: true,
        userId: currentUserId,
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
   * Verifica se esiste almeno un utente registrato
   */
  async isUserRegistered(): Promise<boolean> {
    const users = await this.getAllUsers();
    return users.length > 0;
  }

  /**
   * Verifica se l'utente corrente ha una sessione attiva
   */
  async hasActiveSession(): Promise<boolean> {
    const currentUserId = await SecureStore.getItemAsync('current_user_id');
    if (!currentUserId) {
      return false;
    }
    const sessionToken = await SecureStore.getItemAsync(`user_${currentUserId}_session_token`);
    return sessionToken !== null;
  }

  /**
   * Logout - rimuove session token dell'utente corrente
   */
  async logout(): Promise<void> {
    const currentUserId = await SecureStore.getItemAsync('current_user_id');
    if (currentUserId) {
      await SecureStore.deleteItemAsync(`user_${currentUserId}_session_token`);
    }
    // Rimuovi utente corrente (torna alla welcome screen)
    await SecureStore.deleteItemAsync('current_user_id');
    this.sessionToken = null;
  }

  /**
   * Elimina account - GDPR right to erasure
   */
  async deleteAccount(): Promise<void> {
    const currentUserId = await SecureStore.getItemAsync('current_user_id');
    if (!currentUserId) {
      throw new Error('No user logged in');
    }

    // Elimina tutti i dati dal database locale
    await SecureDatabase.deleteAllData();

    // Elimina tutte le credenziali dell'utente
    await SecureStore.deleteItemAsync(`user_${currentUserId}_email`);
    await SecureStore.deleteItemAsync(`user_${currentUserId}_password_hash`);
    await SecureStore.deleteItemAsync(`user_${currentUserId}_session_token`);
    await SecureStore.deleteItemAsync(`user_${currentUserId}_pin_hash`);

    // Rimuovi dalla lista utenti
    await this.removeUserFromList(currentUserId);

    // Rimuovi utente corrente
    await SecureStore.deleteItemAsync('current_user_id');

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
    return await SecureStore.getItemAsync('current_user_id');
  }
}

// Singleton instance
export default new AuthService();
