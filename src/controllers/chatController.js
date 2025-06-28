import { TremitiBotBedrock } from '../services/TremitiBotBedrock.js';

let bot;

// Inizializza bot con gestione errori
try {
  bot = new TremitiBotBedrock();
} catch (error) {
  console.error('❌ Errore inizializzazione bot:', error);
}

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

      if (!bot) {
        return res.status(500).json({
          success: false,
          error: 'Bot non inizializzato',
          fallbackMessage: "Servizio temporaneamente non disponibile. Contatta [Fuffy](https://tremitinow.it/cGFnZS82Mw==)"
        });
      }

      console.log(`📨 [${new Date().toISOString()}] Messaggio: "${message.substring(0, 50)}..."`);
      
      const response = await bot.sendMessage(message, history);
      
      if (response.success) {
        console.log(`✅ [${new Date().toISOString()}] Risposta inviata (${response.usage.outputTokens} tokens)`);
        res.json({
          success: true,
          message: response.message,
          usage: response.usage,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`❌ [${new Date().toISOString()}] Errore bot: ${response.error}`);
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
  },

  async healthCheck(req, res) {
    const status = {
      status: 'OK',
      service: 'TremitiBotBedrock',
      timestamp: new Date().toISOString(),
      bot: bot ? 'Initialized' : 'Not initialized',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    };

    res.json(status);
  }
};