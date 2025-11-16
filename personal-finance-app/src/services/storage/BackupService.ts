/**
 * BackupService - Backup cifrato end-to-end opzionale
 * - Dati cifrati PRIMA dell'upload al server
 * - Server riceve solo blob cifrato (zero-knowledge)
 * - Solo l'utente può decifrare con la passphrase
 * - Supporto per export/import completo
 */

import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import SecureDatabase from './SecureDatabase';
import { Transaction, Account, Budget, Category, EncryptedBackup } from '../../types';

interface BackupData {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  categories?: Category[];
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0';
  private readonly PBKDF2_ITERATIONS = 100000;

  /**
   * Crea backup cifrato end-to-end
   * La cifratura avviene completamente client-side
   */
  async createEncryptedBackup(userPassphrase: string): Promise<EncryptedBackup> {
    try {
      // Raccoglie tutti i dati dal database locale
      const data: BackupData = {
        version: this.BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        transactions: await SecureDatabase.getAllTransactions(),
        accounts: await SecureDatabase.getAllAccounts(),
        budgets: [], // TODO: implement when budgets are ready
        categories: []
      };

      // Converte in JSON
      const jsonData = JSON.stringify(data);

      // Genera salt casuale per PBKDF2
      const saltBytes = await Crypto.getRandomBytesAsync(16);
      const salt = this.bytesToBase64(saltBytes);

      // Deriva chiave di cifratura dalla passphrase utente
      // NOTA: expo-crypto non supporta PBKDF2, quindi usiamo SHA-256 multiple volte
      // In produzione, usa una libreria crypto più completa
      let key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userPassphrase + salt
      );

      // Iterazioni multiple per rafforzare la chiave
      for (let i = 0; i < 1000; i++) {
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          key
        );
      }

      // Cifra i dati (XOR semplice - in produzione usa AES-256)
      // NOTA: Questa è una cifratura semplificata per demo
      // In produzione, usa react-native-aes-crypto o simili
      const encrypted = this.simpleEncrypt(jsonData, key);

      // Calcola checksum per verificare integrità
      const checksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        encrypted
      );

      return {
        encryptedData: encrypted,
        salt,
        checksum,
        timestamp: Date.now(),
        platform: Platform.OS
      };
    } catch (error) {
      console.error('Failed to create encrypted backup:', error);
      throw new Error('Backup creation failed');
    }
  }

  /**
   * Upload backup al server (opzionale)
   * Il server riceve SOLO dati cifrati, non può leggerli
   */
  async uploadBackup(encryptedBackup: EncryptedBackup): Promise<boolean> {
    try {
      // In produzione, questo invia al tuo server
      /*
      const response = await fetch('https://api.app.com/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup: encryptedBackup.encryptedData,
          salt: encryptedBackup.salt,
          checksum: encryptedBackup.checksum,
          platform: encryptedBackup.platform,
          timestamp: encryptedBackup.timestamp
        })
      });

      return response.ok;
      */

      // Per demo, salva localmente
      const backupPath = `${FileSystem.documentDirectory}backup_${encryptedBackup.timestamp}.json`;
      await FileSystem.writeAsStringAsync(
        backupPath,
        JSON.stringify(encryptedBackup)
      );

      console.log(`Backup saved locally at: ${backupPath}`);
      return true;
    } catch (error) {
      console.error('Failed to upload backup:', error);
      return false;
    }
  }

  /**
   * Download backup dal server
   */
  async downloadBackup(): Promise<EncryptedBackup | null> {
    try {
      // In produzione, questo scarica dal server
      /*
      const response = await fetch('https://api.app.com/backup/latest', {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      return await response.json();
      */

      // Per demo, legge dal file locale più recente
      const backupDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(backupDir!);
      const backupFiles = files.filter(f => f.startsWith('backup_'));

      if (backupFiles.length === 0) {
        return null;
      }

      // Trova il backup più recente
      const latestBackup = backupFiles.sort().reverse()[0];
      const backupPath = `${backupDir}${latestBackup}`;
      const content = await FileSystem.readAsStringAsync(backupPath);

      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to download backup:', error);
      return null;
    }
  }

  /**
   * Restore dal backup cifrato
   * Richiede la passphrase per decifrare
   */
  async restoreFromBackup(
    encryptedBackup: EncryptedBackup,
    userPassphrase: string
  ): Promise<boolean> {
    try {
      // Verifica checksum
      const checksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        encryptedBackup.encryptedData
      );

      if (checksum !== encryptedBackup.checksum) {
        throw new Error('Backup integrity check failed - data may be corrupted');
      }

      // Deriva la stessa chiave dalla passphrase
      let key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userPassphrase + encryptedBackup.salt
      );

      for (let i = 0; i < 1000; i++) {
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          key
        );
      }

      // Decifra i dati
      const decrypted = this.simpleDecrypt(encryptedBackup.encryptedData, key);

      // Parse JSON
      const data: BackupData = JSON.parse(decrypted);

      // Verifica versione
      if (data.version !== this.BACKUP_VERSION) {
        console.warn(`Backup version mismatch: ${data.version} vs ${this.BACKUP_VERSION}`);
      }

      // Importa i dati nel database locale
      await this.importData(data);

      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  /**
   * Export dati in formato JSON (non cifrato, per portabilità)
   */
  async exportToJSON(): Promise<string> {
    const data: BackupData = {
      version: this.BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions: await SecureDatabase.getAllTransactions(),
      accounts: await SecureDatabase.getAllAccounts(),
      budgets: [],
      categories: []
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export in formato CSV
   */
  async exportToCSV(): Promise<string> {
    const transactions = await SecureDatabase.getAllTransactions();

    // Header CSV
    let csv = 'Date,Description,Amount,Category,Account,Merchant,Notes\n';

    // Righe dati con sanitizzazione per prevenire CSV injection
    for (const t of transactions) {
      const date = new Date(t.date).toISOString().split('T')[0];
      const description = this.sanitizeCSVField(t.description);
      const amount = t.amount.toFixed(2);
      const category = this.sanitizeCSVField(t.category);
      const merchant = this.sanitizeCSVField(t.merchant || '');
      const notes = this.sanitizeCSVField(t.notes || '');

      csv += `${date},"${description}",${amount},"${category}","${merchant}","${notes}"\n`;
    }

    return csv;
  }

  /**
   * Import dati da backup
   */
  private async importData(data: BackupData): Promise<void> {
    // Inizializza database se necessario
    await SecureDatabase.initialize();

    // Importa transazioni
    for (const transaction of data.transactions) {
      await SecureDatabase.insertTransaction({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        accountId: transaction.accountId,
        merchant: transaction.merchant,
        notes: transaction.notes,
        receiptPath: transaction.receiptPath
      });
    }

    // Importa accounts
    for (const account of data.accounts) {
      await SecureDatabase.insertAccount({
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        bankConnectionId: account.bankConnectionId,
        lastSync: account.lastSync,
        isManual: account.isManual
      });
    }

    console.log('Data imported successfully');
  }

  /**
   * Sanitizza campo CSV per prevenire injection
   */
  private sanitizeCSVField(field: string): string {
    if (!field) return '';

    // Rimuove caratteri pericolosi che potrebbero essere interpretati come formule
    let sanitized = field.replace(/^[=+\-@\t]/g, "'");

    // Escape doppi apici
    sanitized = sanitized.replace(/"/g, '""');

    return sanitized;
  }

  /**
   * Cifratura semplice XOR (SOLO PER DEMO)
   * In produzione usa AES-256-GCM
   */
  private simpleEncrypt(data: string, key: string): string {
    const dataBytes = new TextEncoder().encode(data);
    const keyBytes = new TextEncoder().encode(key);
    const encrypted = new Uint8Array(dataBytes.length);

    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return this.bytesToBase64(encrypted);
  }

  /**
   * Decifratura semplice XOR (SOLO PER DEMO)
   */
  private simpleDecrypt(encryptedBase64: string, key: string): string {
    const encrypted = this.base64ToBytes(encryptedBase64);
    const keyBytes = new TextEncoder().encode(key);
    const decrypted = new Uint8Array(encrypted.length);

    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Utility: converti bytes in base64
   */
  private bytesToBase64(bytes: Uint8Array): string {
    const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join('');
    return btoa(binString);
  }

  /**
   * Utility: converti base64 in bytes
   */
  private base64ToBytes(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
  }
}

export default new BackupService();
