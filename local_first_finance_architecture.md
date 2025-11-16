# Architettura Local-First per App Finanziaria con Privacy Massima

## Separazione strategica dei dati: locale vs cloud

**Dati sul dispositivo (100% offline)**
```
- Transazioni complete (importi, descrizioni, merchant)
- Saldi bancari e conti
- Budget e obiettivi finanziari
- Categorie personalizzate
- Note e allegati (ricevute, documenti)
- Connessioni bancarie e token OAuth
- Storico completo finanziario
- Report e analytics calcolati
```

**Dati sul server (minimi indispensabili)**
```
- User ID anonimo (UUID)
- Email hashata per recupero password
- Hash password + salt per autenticazione
- Device fingerprint per sicurezza
- Timestamp ultimo accesso
- Metriche anonime aggregate:
  - Numero transazioni (senza importi)
  - Frequenza utilizzo features
  - Crash reports senza dati sensibili
  - Performance metrics (tempi caricamento)
```

## Implementazione SQLCipher con encryption locale

```javascript
// storage/SecureDatabase.js
import SQLite from 'react-native-sqlcipher-storage';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

class SecureDatabase {
  constructor() {
    this.db = null;
    this.encryptionKey = null;
  }

  async initialize() {
    // Genera o recupera chiave master dal secure storage hardware
    this.encryptionKey = await this.getMasterKey();
    
    // Apre database cifrato localmente
    this.db = await SQLite.openDatabase(
      {
        name: 'finance_local.db',
        location: 'default',
        key: this.encryptionKey
      }
    );
    
    await this.createTables();
  }

  async getMasterKey() {
    let key = await SecureStore.getItemAsync('db_master_key');
    
    if (!key) {
      // Prima apertura: genera chiave casuale
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      await SecureStore.setItemAsync('db_master_key', key);
    }
    
    return key;
  }

  async createTables() {
    // Tabella transazioni - completamente locale
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        description TEXT,
        category TEXT,
        date INTEGER NOT NULL,
        account_id TEXT,
        merchant TEXT,
        notes TEXT,
        receipt_path TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Tabella accounts - locale con sync opzionale
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        balance REAL,
        currency TEXT DEFAULT 'EUR',
        bank_connection_id TEXT,
        last_sync INTEGER,
        is_manual BOOLEAN DEFAULT 1
      )
    `);

    // Indici per performance su query frequenti
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)'
    );
  }
}

export default new SecureDatabase();
```

## Sync opzionale con backup cifrato end-to-end

```javascript
// services/BackupService.js
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

class BackupService {
  constructor() {
    this.backupKey = null;
  }

  // Backup cifrato end-to-end opzionale
  async createEncryptedBackup(data, userPassphrase) {
    // Deriva chiave dal passphrase utente con PBKDF2
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const key = CryptoJS.PBKDF2(userPassphrase, salt, {
      keySize: 256/32,
      iterations: 100000
    });

    // Cifra i dati localmente prima dell'upload
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      key,
      { iv: salt }
    ).toString();

    // Il server riceve solo blob cifrato, zero knowledge
    return {
      encryptedData: encrypted,
      salt: salt.toString(),
      checksum: CryptoJS.SHA256(encrypted).toString()
    };
  }

  async uploadBackup(encryptedBackup) {
    // Upload solo dati cifrati - server non può decifrare
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
        platform: Platform.OS,
        timestamp: Date.now()
      })
    });
    
    return response.json();
  }

  // Restore richiede passphrase - decifratura solo client-side
  async restoreFromBackup(userPassphrase) {
    const backup = await this.downloadBackup();
    
    const key = CryptoJS.PBKDF2(userPassphrase, backup.salt, {
      keySize: 256/32,
      iterations: 100000
    });

    const decrypted = CryptoJS.AES.decrypt(
      backup.encryptedData,
      key
    ).toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  }
}
```

## Autenticazione minimalista senza dati sensibili

```javascript
// auth/AuthService.js
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  async registerUser(email, password) {
    // Genera UUID anonimo per l'utente
    const userId = uuidv4();
    
    // Hash email per privacy (one-way, non reversibile)
    const emailHash = CryptoJS.SHA256(email.toLowerCase()).toString();
    
    // Argon2 o scrypt per password (più sicuro di bcrypt)
    const passwordHash = await this.hashPassword(password);
    
    // Invia al server solo hash, mai plaintext
    const response = await fetch('https://api.app.com/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        emailHash,
        passwordHash,
        deviceInfo: {
          platform: Platform.OS,
          model: Device.modelName,
          // Nessun dato identificativo personale
        }
      })
    });

    // Salva token localmente per sessioni future
    const { sessionToken } = await response.json();
    await SecureStore.setItemAsync('session_token', sessionToken);
    
    // Inizializza database locale per nuovo utente
    await this.initializeLocalDatabase(userId);
  }

  async unlockApp() {
    // Preferisci biometria per unlock quotidiano
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sblocca la tua app finanziaria',
        fallbackLabel: 'Usa PIN',
        cancelLabel: 'Annulla'
      });
      
      if (result.success) {
        return this.decryptLocalDatabase();
      }
    }
    
    // Fallback su PIN locale (mai inviato al server)
    return this.unlockWithPIN();
  }

  async unlockWithPIN() {
    // PIN verificato solo localmente
    const storedPINHash = await SecureStore.getItemAsync('pin_hash');
    // Implementa UI per inserimento PIN
    // Verifica hash locale senza server round-trip
  }
}
```

## Integrazione bancaria con storage token locale

```javascript
// banking/BankConnectionService.js
class BankConnectionService {
  async connectBank(bankId) {
    // OAuth flow standard
    const authUrl = `https://bankaccountdata.gocardless.com/psd2/start/
      ?institution_id=${bankId}
      &redirect=${encodeURIComponent('myapp://oauth-callback')}`;
    
    // Apre browser per consenso
    const result = await WebBrowser.openAuthSessionAsync(authUrl);
    
    if (result.type === 'success') {
      const { code } = parseAuthResponse(result.url);
      
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code);
      
      // CRITICO: Tokens salvati SOLO localmente
      await this.saveTokensLocally(tokens);
      
      // Fetch dati bancari e salva localmente
      await this.syncBankData(tokens);
    }
  }

  async saveTokensLocally(tokens) {
    // Cifra tokens prima del salvataggio
    const encrypted = await this.encryptSensitiveData({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at
    });
    
    // Salva nel database locale cifrato
    await SecureDatabase.saveTokens(encrypted);
    
    // MAI inviare tokens al tuo server!
  }

  async syncBankData(tokens) {
    // Usa tokens per fetch dati da banca
    const accounts = await this.fetchAccounts(tokens.access_token);
    const transactions = await this.fetchTransactions(tokens.access_token);
    
    // Salva tutto localmente
    await SecureDatabase.saveAccounts(accounts);
    await SecureDatabase.saveTransactions(transactions);
    
    // Invia al server SOLO metriche anonime
    await this.sendAnonymousMetrics({
      syncSuccess: true,
      accountsCount: accounts.length,
      transactionsCount: transactions.length,
      // Nessun importo o dato sensibile
    });
  }
}
```

## Metriche anonime per miglioramento prodotto

```javascript
// analytics/PrivacyAnalytics.js
class PrivacyAnalytics {
  // Traccia solo comportamenti, mai dati
  async trackEvent(eventName, properties = {}) {
    const safeProperties = this.sanitizeProperties(properties);
    
    // Buffer eventi localmente
    this.eventBuffer.push({
      event: eventName,
      properties: safeProperties,
      timestamp: Date.now(),
      sessionId: this.getAnonymousSessionId()
    });
    
    // Batch upload periodico
    if (this.eventBuffer.length > 20) {
      await this.flushEvents();
    }
  }

  sanitizeProperties(properties) {
    // Rimuovi qualsiasi dato sensibile
    const safe = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Whitelist di proprietà sicure
      if (this.isSafeProperty(key)) {
        // Anonimizza valori numerici
        if (typeof value === 'number' && key.includes('amount')) {
          // Invia solo range, non valore esatto
          safe[key + '_range'] = this.getRange(value);
        } else {
          safe[key] = value;
        }
      }
    }
    
    return safe;
  }

  getRange(value) {
    // Converte importi in range anonimi
    if (value < 10) return '0-10';
    if (value < 50) return '10-50';
    if (value < 100) return '50-100';
    if (value < 500) return '100-500';
    return '500+';
  }

  isSafeProperty(key) {
    const safeKeys = [
      'screen_name',
      'button_clicked',
      'feature_used',
      'error_type',
      'load_time_ms',
      'category_type' // tipo, non valore
    ];
    
    return safeKeys.some(safe => key.includes(safe));
  }
}
```

## Migrazione e export dati per portabilità totale

```javascript
// data/DataPortability.js
class DataPortability {
  async exportAllData(format = 'json') {
    // L'utente possiede completamente i suoi dati
    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      transactions: await SecureDatabase.getAllTransactions(),
      accounts: await SecureDatabase.getAllAccounts(),
      budgets: await SecureDatabase.getAllBudgets(),
      categories: await SecureDatabase.getAllCategories()
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }
  }

  async importData(fileContent, format = 'json') {
    // Validazione rigorosa prima dell'import
    const data = format === 'json' 
      ? JSON.parse(fileContent)
      : this.parseCSV(fileContent);
    
    // Validazione schema
    if (!this.validateDataSchema(data)) {
      throw new Error('Invalid data format');
    }
    
    // Sanitizzazione per prevenire injection
    const sanitized = this.sanitizeImportedData(data);
    
    // Import transazionale
    await SecureDatabase.transaction(async (tx) => {
      for (const transaction of sanitized.transactions) {
        await tx.insertTransaction(transaction);
      }
    });
  }

  async deleteAllData() {
    // GDPR right to erasure - cancellazione completa
    await SecureDatabase.dropAllTables();
    await SecureStore.deleteItemAsync('db_master_key');
    await SecureStore.deleteItemAsync('session_token');
    
    // Notifica server per cancellare account (solo metadati)
    await this.requestServerDataDeletion();
  }
}
```

## Vantaggi dell'architettura local-first

**Privacy by Design**
- Zero dati finanziari nel cloud
- Nessun rischio data breach del server
- Conformità GDPR automatica (dati restano nell'UE sul dispositivo)
- Nessuna profilazione o vendita dati possibile

**Costi ridotti drasticamente**
- Database server: €0-10/mese (solo auth)
- Storage cloud: €0 (tutto locale)
- Bandwidth: minimo (solo metriche)
- Compliance audit: semplificato senza dati sensibili

**Performance superiore**
- Query istantanee su database locale
- Nessuna latenza di rete per operazioni comuni
- Offline-first: funziona sempre
- Sync solo quando necessario

**Trust dell'utente**
- "I tuoi dati restano tuoi" come selling point
- Nessun lock-in: export sempre possibile
- Trasparenza totale su cosa viene condiviso
- Differenziazione dai competitor cloud-based

## Testing della sicurezza locale

```javascript
// __tests__/security/LocalSecurity.test.js
describe('Local Data Security', () => {
  test('Database è cifrato a riposo', async () => {
    // Tenta di leggere file database raw
    const dbPath = await SecureDatabase.getDatabasePath();
    const rawContent = await FileSystem.readAsStringAsync(dbPath);
    
    // Non deve contenere testo leggibile
    expect(rawContent).not.toContain('transaction');
    expect(rawContent).not.toContain('SELECT');
  });

  test('Keys sono in secure storage hardware', async () => {
    // Verifica che keys non siano in plaintext storage
    const prefs = await AsyncStorage.getAllKeys();
    expect(prefs).not.toContain('db_master_key');
    expect(prefs).not.toContain('oauth_token');
  });

  test('Export richiede autenticazione', async () => {
    // Mock biometric prompt
    LocalAuthentication.authenticateAsync = jest.fn()
      .mockResolvedValue({ success: false });
    
    // Export deve fallire senza auth
    await expect(DataPortability.exportAllData())
      .rejects.toThrow('Authentication required');
  });
});
```

## Roadmap implementazione privacy-first

**Sprint 1-2: Foundation locale**
- Setup SQLCipher con encryption
- Implementa secure key management
- Crea schema database locale completo
- Zero networking inizialmente

**Sprint 3-4: Auth minimalista**
- Registrazione con email hash
- Login senza trasmissione password plaintext
- Biometric unlock locale
- PIN backup offline

**Sprint 5-6: Features offline**
- CRUD transazioni locale
- Calcoli e aggregazioni client-side
- Grafici da dati locali
- Export/import senza cloud

**Sprint 7-8: Sync opzionale**
- Backup cifrato end-to-end opt-in
- Metriche anonime aggregate
- Recovery via passphrase
- Multi-device sync futuro (opzionale)

## Considerazioni legali semplificate

Con architettura local-first:
- **GDPR**: Minimal compliance needed (no personal data processing)
- **PCI DSS**: Non applicabile (no card data storage)
- **Privacy Policy**: Semplice - "We don't see your financial data"
- **Data breach**: Rischio quasi zero (no central database)

L'approccio elimina il 90% delle complessità regulatory mantenendo un prodotto premium per utenti privacy-conscious.