/**
 * Esempio di client JavaScript per chiamare la Lambda function TremitiBot
 * 
 * Questo file mostra come integrare la Lambda function nella tua applicazione
 */

class TremitiBotClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.conversationHistory = [];
  }

  /**
   * Invia un messaggio al bot
   * @param {string} message - Il messaggio da inviare
   * @returns {Promise<Object>} - La risposta del bot
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: this.conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Aggiorna la cronologia della conversazione
        this.conversationHistory.push({
          role: 'user',
          content: message
        });
        this.conversationHistory.push({
          role: 'assistant',
          content: data.message
        });
      }

      return data;
    } catch (error) {
      console.error('Errore nella chiamata al bot:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "Mi dispiace, c'è stato un problema di connessione."
      };
    }
  }

  /**
   * Pulisce la cronologia della conversazione
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Ottiene la cronologia della conversazione
   * @returns {Array} - La cronologia
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Health check della Lambda function
   * @returns {Promise<Object>} - Status del servizio
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Errore health check:', error);
      return { status: 'ERROR', error: error.message };
    }
  }
}

// Esempio di utilizzo
async function exampleUsage() {
  // Sostituisci con l'URL della tua Lambda function
  const apiUrl = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';
  
  const bot = new TremitiBotClient(apiUrl);

  console.log('🏝️ Test TremitiBot Lambda Client\n');

  // Health check
  console.log('📋 Health check...');
  const health = await bot.healthCheck();
  console.log('Health:', health);
  console.log('');

  // Test messaggio
  console.log('📋 Invio messaggio...');
  const response = await bot.sendMessage('Orari traghetti domani da Termoli');
  
  if (response.success) {
    console.log('✅ Risposta ricevuta:');
    console.log('Messaggio:', response.message.substring(0, 100) + '...');
    console.log('Token utilizzati:', response.usage);
    console.log('Timestamp:', response.timestamp);
  } else {
    console.log('❌ Errore:', response.error);
    console.log('Fallback:', response.fallbackMessage);
  }

  console.log('');
  console.log('📊 Cronologia conversazione:');
  console.log(bot.getHistory());
}

// Esempio per React/Next.js
export function useTremitiBot(apiUrl) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);

    try {
      const bot = new TremitiBotClient(apiUrl);
      const response = await bot.sendMessage(message);

      if (response.success) {
        setMessages(prev => [...prev, 
          { role: 'user', content: message },
          { role: 'assistant', content: response.message }
        ]);
      } else {
        setError(response.error || 'Errore sconosciuto');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}

// Esempio per Vue.js
export function useTremitiBotVue(apiUrl) {
  const messages = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const sendMessage = async (message) => {
    loading.value = true;
    error.value = null;

    try {
      const bot = new TremitiBotClient(apiUrl);
      const response = await bot.sendMessage(message);

      if (response.success) {
        messages.value.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response.message }
        );
      } else {
        error.value = response.error || 'Errore sconosciuto';
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const clearMessages = () => {
    messages.value = [];
  };

  return {
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    sendMessage,
    clearMessages
  };
}

// Esempio per Angular
export class TremitiBotService {
  private apiUrl: string;
  private conversationHistory: any[] = [];

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async sendMessage(message: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: this.conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.conversationHistory.push(
          { role: 'user', content: message },
          { role: 'assistant', content: data.message }
        );
      }

      return data;
    } catch (error) {
      console.error('Errore nella chiamata al bot:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "Mi dispiace, c'è stato un problema di connessione."
      };
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): any[] {
    return this.conversationHistory;
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Errore health check:', error);
      return { status: 'ERROR', error: error.message };
    }
  }
}

// Esegui l'esempio se questo file viene eseguito direttamente
if (typeof window === 'undefined') {
  // Node.js environment
  exampleUsage().catch(console.error);
} 