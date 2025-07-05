# 🔗 Guida Integrazione TremitiBot Lambda

Guida completa per integrare la Lambda function TremitiBot nella tua applicazione esistente.

## 📋 Panoramica

La Lambda function espone il bot TremitiBot tramite API Gateway, permettendo alla tua app di:
- Inviare messaggi al bot
- Ricevere risposte in tempo reale
- Mantenere la cronologia della conversazione
- Gestire errori e fallback

## 🚀 Integrazione Rapida

### 1. Sostituisci l'endpoint nel tuo codice

**Prima (server locale):**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**Dopo (Lambda function):**
```javascript
const API_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';
```

### 2. Aggiorna le chiamate API

La struttura delle richieste e risposte rimane identica:

```javascript
// Richiesta
const response = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Orari traghetti domani da Termoli',
    history: conversationHistory
  })
});

// Risposta
const data = await response.json();
if (data.success) {
  console.log('Risposta bot:', data.message);
  console.log('Token utilizzati:', data.usage);
} else {
  console.log('Errore:', data.error);
}
```

## 🔧 Integrazione Dettagliata

### Modifica del Controller Esistente

Aggiorna `src/controllers/chatController.js`:

```javascript
import { TremitiBotBedrock } from '../services/TremitiBotBedrock.js';

// Configurazione endpoint Lambda
const LAMBDA_API_URL = process.env.LAMBDA_API_URL || 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

export const chatController = {
  async sendMessage(req, res) {
    try {
      const { message, history = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Messaggio richiesto' 
        });
      }

      console.log(`📨 [${new Date().toISOString()}] Messaggio: "${message.substring(0, 50)}..."`);
      
      // Chiamata alla Lambda function
      const lambdaResponse = await fetch(`${LAMBDA_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });
      
      const data = await lambdaResponse.json();
      
      if (data.success) {
        console.log(`✅ [${new Date().toISOString()}] Risposta Lambda (${data.usage.outputTokens} tokens)`);
        res.json({
          success: true,
          message: data.message,
          usage: data.usage,
          timestamp: data.timestamp
        });
      } else {
        console.log(`❌ [${new Date().toISOString()}] Errore Lambda: ${data.error}`);
        res.status(500).json({
          success: false,
          error: data.error,
          fallbackMessage: data.fallbackMessage
        });
      }

    } catch (error) {
      console.error('❌ Errore controller:', error);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        fallbackMessage: "Mi dispiace, c'è stato un problema. Contatta [Fuffy](https://tremitinow.it/cGFnZS82Mw==) per assistenza.",
        timestamp: new Date().toISOString()
      });
    }
  },

  async healthCheck(req, res) {
    try {
      // Health check della Lambda function
      const lambdaHealth = await fetch(`${LAMBDA_API_URL}/health`);
      const lambdaStatus = await lambdaHealth.json();
      
      const status = {
        status: 'OK',
        service: 'TremitiBotBedrock',
        timestamp: new Date().toISOString(),
        lambda: lambdaStatus.status || 'Unknown',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      };

      res.json(status);
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
```

### Aggiornamento delle Variabili d'Ambiente

Aggiungi al tuo `.env`:

```env
# Lambda Function Configuration
LAMBDA_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod

# Fallback alla versione locale (opzionale)
USE_LOCAL_BOT=false
```

### Gestione Fallback

Implementa un fallback alla versione locale in caso di problemi con la Lambda:

```javascript
export const chatController = {
  async sendMessage(req, res) {
    try {
      const { message, history = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Messaggio richiesto' 
        });
      }

      // Prova prima la Lambda function
      if (process.env.USE_LOCAL_BOT !== 'true') {
        try {
          const lambdaResponse = await fetch(`${LAMBDA_API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
            timeout: 10000 // 10 secondi timeout
          });
          
          const data = await lambdaResponse.json();
          
          if (data.success) {
            return res.json({
              success: true,
              message: data.message,
              usage: data.usage,
              timestamp: data.timestamp
            });
          }
        } catch (lambdaError) {
          console.warn('⚠️ Lambda function non disponibile, fallback a locale:', lambdaError.message);
        }
      }

      // Fallback alla versione locale
      if (!bot) {
        return res.status(500).json({
          success: false,
          error: 'Bot non disponibile',
          fallbackMessage: "Servizio temporaneamente non disponibile. Contatta [Fuffy](https://tremitinow.it/cGFnZS82Mw==)"
        });
      }

      const response = await bot.sendMessage(message, history);
      
      if (response.success) {
        res.json({
          success: true,
          message: response.message,
          usage: response.usage,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: response.error,
          fallbackMessage: response.fallbackMessage
        });
      }

    } catch (error) {
      console.error('❌ Errore controller:', error);
      res.status(500).json({
        success: false,
        error: 'Errore interno del server',
        fallbackMessage: "Mi dispiace, c'è stato un problema. Contatta [Fuffy](https://tremitinow.it/cGFnZS82Mw==) per assistenza.",
        timestamp: new Date().toISOString()
      });
    }
  }
};
```

## 📱 Integrazione Frontend

### React/Next.js

```javascript
// hooks/useTremitiBot.js
import { useState, useCallback } from 'react';

export function useTremitiBot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_LAMBDA_API_URL || 
                  'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, 
          { role: 'user', content: message },
          { role: 'assistant', content: data.message }
        ]);
      } else {
        setError(data.error || 'Errore sconosciuto');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messages, API_URL]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}
```

### Vue.js

```javascript
// composables/useTremitiBot.js
import { ref, computed } from 'vue';

export function useTremitiBot() {
  const messages = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const API_URL = import.meta.env.VITE_LAMBDA_API_URL || 
                  'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

  const sendMessage = async (message) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.value
        })
      });

      const data = await response.json();

      if (data.success) {
        messages.value.push(
          { role: 'user', content: message },
          { role: 'assistant', content: data.message }
        );
      } else {
        error.value = data.error || 'Errore sconosciuto';
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const clearMessages = () => {
    messages.value = [];
    error.value = null;
  };

  return {
    messages: computed(() => messages.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    sendMessage,
    clearMessages
  };
}
```

## 🔄 Migrazione Graduale

### Fase 1: Setup e Test
1. Deploy della Lambda function
2. Test dell'endpoint
3. Configurazione CORS
4. Test di integrazione

### Fase 2: Integrazione Parallela
1. Mantieni entrambe le versioni attive
2. Usa la Lambda per il 10% del traffico
3. Monitora performance e errori
4. Gradualmente aumenta la percentuale

### Fase 3: Migrazione Completa
1. Sposta tutto il traffico sulla Lambda
2. Mantieni la versione locale come backup
3. Monitora per 1-2 settimane
4. Rimuovi la versione locale

## 📊 Monitoraggio

### Metriche da Monitorare

1. **Performance Lambda**:
   - Duration (target: < 5 secondi)
   - Memory usage (target: < 400MB)
   - Error rate (target: < 1%)

2. **API Gateway**:
   - 4xx/5xx error rate
   - Latency
   - Request count

3. **Business Metrics**:
   - Messaggi processati
   - Token utilizzati
   - User satisfaction

### CloudWatch Alarms

```bash
# Crea alarm per error rate
aws cloudwatch put-metric-alarm \
  --alarm-name "TremitiBot-ErrorRate" \
  --alarm-description "Error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Crea alarm per duration
aws cloudwatch put-metric-alarm \
  --alarm-name "TremitiBot-Duration" \
  --alarm-description "Duration > 25 seconds" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 25000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🛠️ Troubleshooting

### Problemi Comuni

#### 1. CORS Errors
```javascript
// Verifica headers CORS
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://yourdomain.com'
  }
});
```

#### 2. Timeout
```javascript
// Aumenta timeout
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  signal: AbortSignal.timeout(30000) // 30 secondi
});
```

#### 3. Rate Limiting
```javascript
// Implementa retry con exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

## 📞 Supporto

Per problemi di integrazione:

1. **Controlla i log**: CloudWatch Logs per la Lambda
2. **Testa l'endpoint**: Usa cURL o Postman
3. **Verifica CORS**: Controlla headers e origini
4. **Monitora metriche**: CloudWatch Metrics
5. **Contatta supporto**: Team di sviluppo

---

*Guida integrazione v1.0 - TremitiBot Lambda Function* 