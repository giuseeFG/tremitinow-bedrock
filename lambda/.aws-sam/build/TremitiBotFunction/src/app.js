import express from 'express';
import cors from 'cors';
import { chatController } from './controllers/chatController.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.post('/api/chat', chatController.sendMessage);
app.get('/api/health', chatController.healthCheck);

// Home page con interfaccia di test
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>🏝️ TremitiBot Bedrock</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #2c3e50; text-align: center; margin-bottom: 10px; }
          .subtitle { text-align: center; color: #7f8c8d; margin-bottom: 30px; }
          .endpoint { 
            background: #f8f9fa; 
            padding: 15px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border-left: 4px solid #3498db;
          }
          .test-form { 
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); 
            color: white;
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0; 
          }
          input[type="text"] { 
            width: 100%; 
            padding: 12px; 
            margin: 15px 0; 
            border: none;
            border-radius: 6px;
            font-size: 16px;
            box-sizing: border-box;
          }
          button { 
            background: #27ae60; 
            color: white; 
            padding: 12px 25px; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s;
          }
          button:hover { background: #219a52; }
          button:disabled { background: #95a5a6; cursor: not-allowed; }
          #response { 
            background: #fff; 
            color: #2c3e50;
            padding: 20px; 
            border-radius: 8px; 
            margin: 15px 0; 
            border-left: 4px solid #3498db; 
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
          }
          .loading { background: #f39c12; color: white; }
          .error { background: #e74c3c; color: white; }
          .success { background: #27ae60; color: white; }
          code { background: #ecf0f1; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏝️ TremitiBot Bedrock</h1>
          <p class="subtitle">Bot assistente per le Isole Tremiti usando Amazon Bedrock e Claude 3.5 Sonnet</p>
          
          <h3>📡 API Endpoints:</h3>
          <div class="endpoint">
            <strong>POST /api/chat</strong> - Invia messaggio al bot<br>
            <code>{ "message": "Il tuo messaggio", "history": [] }</code>
          </div>
          <div class="endpoint">
            <strong>GET /api/health</strong> - Status del servizio
          </div>

          <div class="test-form">
            <h3>🧪 Test del Bot:</h3>
            <input type="text" id="message" placeholder="Scrivi il tuo messaggio... (es: 'Orari traghetti domani da Termoli')" />
            <button onclick="sendMessage()" id="sendBtn">Invia Messaggio</button>
            <div id="response"></div>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
            <small>🚀 TremitiBot v1.0 - Powered by Amazon Bedrock</small>
          </div>
        </div>

        <script>
          async function sendMessage() {
            const messageInput = document.getElementById('message');
            const responseDiv = document.getElementById('response');
            const sendBtn = document.getElementById('sendBtn');
            const message = messageInput.value.trim();
            
            if (!message) {
              responseDiv.innerHTML = '<span style="color: #e74c3c;">⚠️ Inserisci un messaggio</span>';
              responseDiv.className = 'error';
              return;
            }

            sendBtn.disabled = true;
            sendBtn.textContent = 'Invio...';
            responseDiv.innerHTML = '⏳ Invio messaggio a Claude...';
            responseDiv.className = 'loading';
            
            try {
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: [] })
              });
              
              const data = await response.json();
              
              if (data.success) {
                responseDiv.innerHTML = \`🤖 <strong>TremitiBot:</strong>

\${data.message}

📊 <small>Token: \${data.usage?.inputTokens || 0} input, \${data.usage?.outputTokens || 0} output | \${data.timestamp}</small>\`;
                responseDiv.className = 'success';
              } else {
                responseDiv.innerHTML = \`❌ <strong>Errore:</strong> \${data.error}

\${data.fallbackMessage || 'Riprova più tardi'}\`;
                responseDiv.className = 'error';
              }
            } catch (error) {
              responseDiv.innerHTML = \`❌ <strong>Errore di connessione:</strong> \${error.message}\`;
              responseDiv.className = 'error';
            } finally {
              sendBtn.disabled = false;
              sendBtn.textContent = 'Invia Messaggio';
            }
          }

          // Enter per inviare
          document.getElementById('message').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              sendMessage();
            }
          });

          // Focus automatico
          document.getElementById('message').focus();
        </script>
      </body>
    </html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato',
    availableEndpoints: [
      'GET /',
      'POST /api/chat',
      'GET /api/health'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Errore server:', error);
  res.status(500).json({
    success: false,
    error: 'Errore interno del server',
    fallbackMessage: "Mi dispiace, c'è stato un problema. Contatta [Fuffy](https://tremitinow.it/cGFnZS82Mw==) per assistenza.",
    timestamp: new Date().toISOString()
  });
});

export default app;