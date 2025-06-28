# 🏝️ TremitiBot Lambda Function

Lambda function AWS per esporre il bot TremitiBot come servizio serverless tramite API Gateway.

## 🚀 Caratteristiche

- **Serverless**: Eseguita su AWS Lambda
- **API Gateway**: Esposta tramite REST API
- **CORS**: Supporto completo per richieste cross-origin
- **Bedrock**: Integrazione con Amazon Bedrock e Claude 3.5 Sonnet
- **Dati Completi**: Tutti i dati delle Isole Tremiti inclusi

## 📁 Struttura

```
lambda/
├── index.js              # Handler principale Lambda
├── package.json          # Dipendenze Node.js
├── template.yaml         # Template SAM per deployment
├── test.js              # Test locali
├── README.md            # Documentazione
└── data/                # Database JSON
    ├── json_jet.json
    ├── json_nave.json
    ├── json_gargano.json
    ├── json_zenit.json
    ├── json_elicottero.json
    ├── json_cale.json
    ├── json_pagine.json
    └── json_traghettiinterni.json
```

## 🔧 Configurazione

### Variabili d'Ambiente

La Lambda function utilizza le seguenti variabili d'ambiente:

```env
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_TOKENS=2000
BEDROCK_TEMPERATURE=0.3
AWS_REGION=us-east-1
```

### Permessi IAM

La Lambda function richiede i seguenti permessi:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    }
  ]
}
```

## 🚀 Deployment

### Prerequisiti

1. **AWS CLI** configurato
2. **AWS SAM CLI** installato
3. **Node.js 18+** installato
4. **Permessi AWS** per Lambda, API Gateway, IAM

### Installazione Dipendenze

```bash
cd lambda
npm install
```

### Build e Deploy

```bash
# Build del progetto
sam build

# Deploy su AWS
sam deploy --guided
```

### Deploy Rapido

```bash
# Deploy diretto (usa configurazioni di default)
sam deploy
```

## 📡 API Endpoints

### POST /chat

Endpoint deployato:
```
https://zfp5a9x75b.execute-api.eu-central-1.amazonaws.com/Prod/chat
```

Invia un messaggio al bot TremitiBot.

**Request Body:**
```json
{
  "message": "Orari traghetti domani da Termoli",
  "history": [
    {
      "role": "user",
      "content": "Ciao"
    },
    {
      "role": "assistant", 
      "content": "Ciao! Come posso aiutarti con le Isole Tremiti?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ecco gli orari dei traghetti per domani...",
  "usage": {
    "inputTokens": 1500,
    "outputTokens": 800
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### OPTIONS /chat

Gestione preflight CORS.

### GET /health

Endpoint deployato:
```
https://zfp5a9x75b.execute-api.eu-central-1.amazonaws.com/Prod/health
```

Health check della Lambda function.

## 🧪 Test Locali

### Test con Node.js

```bash
cd lambda
npm test
```

### Test con SAM

```bash
# Test locale con SAM
sam local invoke TremitiBotFunction --event events/test-event.json

# Test API locale
sam local start-api
```

### Test con cURL

```bash
# Test chat
curl -X POST https://your-api-gateway-url/prod/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Orari traghetti domani da Termoli",
    "history": []
  }'

# Test health
curl https://your-api-gateway-url/prod/health
```

## 📊 Monitoraggio

### CloudWatch Logs

I log della Lambda function sono disponibili in CloudWatch:

```
/aws/lambda/tremiti-bot-lambda
```

### Metriche Importanti

- **Duration**: Tempo di esecuzione
- **Memory**: Utilizzo memoria
- **Errors**: Errori e timeout
- **Invocations**: Numero di invocazioni

### Alerting

Configura alert su:
- Error rate > 5%
- Duration > 25 secondi
- Memory utilization > 80%

## 🔄 Aggiornamenti

### Aggiornamento Codice

```bash
# Modifica il codice
# Poi deploy
sam build && sam deploy
```

### Aggiornamento Dati

1. Modifica i file JSON in `data/`
2. Ricrea il package ZIP
3. Aggiorna la Lambda function

```bash
npm run build
aws lambda update-function-code \
  --function-name tremiti-bot-lambda \
  --zip-file fileb://lambda.zip
```

## 🛠️ Troubleshooting

### Errori Comuni

#### 1. Timeout Lambda
- **Causa**: Richiesta Bedrock troppo lenta
- **Soluzione**: Aumenta timeout a 30 secondi

#### 2. Memory Limit
- **Causa**: Caricamento dati JSON troppo pesante
- **Soluzione**: Aumenta memoria a 512MB

#### 3. CORS Errors
- **Causa**: Headers CORS mancanti
- **Soluzione**: Verifica configurazione API Gateway

#### 4. Bedrock Permissions
- **Causa**: Permessi IAM insufficienti
- **Soluzione**: Verifica policy BedrockInvokeModelPolicy

### Debug

```bash
# Logs in tempo reale
aws logs tail /aws/lambda/tremiti-bot-lambda --follow

# Test locale con debug
sam local invoke --debug
```

## 📈 Performance

### Ottimizzazioni

1. **Cold Start**: I dati JSON sono caricati una sola volta
2. **Memory**: 512MB per gestire i dati JSON
3. **Timeout**: 30 secondi per richieste Bedrock
4. **Caching**: Considera CloudFront per API Gateway

### Metriche Target

- **Cold Start**: < 3 secondi
- **Warm Start**: < 1 secondo
- **Memory Usage**: < 400MB
- **Error Rate**: < 1%

## 🔐 Sicurezza

### Best Practices

1. **IAM**: Principio del minimo privilegio
2. **API Gateway**: Rate limiting configurato
3. **CORS**: Origini specifiche (non `*` in produzione)
4. **Logging**: Log sensibili filtrati
5. **Encryption**: Dati in transito e a riposo

### Rate Limiting

Configura in API Gateway:
- **Default**: 10000 requests/second
- **Per IP**: 1000 requests/second
- **Burst**: 5000 requests

## 📞 Supporto

Per problemi con la Lambda function:

1. Controlla CloudWatch Logs
2. Verifica configurazione IAM
3. Testa localmente con SAM
4. Contatta il team di sviluppo

---

*TremitiBot Lambda v1.0 - Powered by AWS Lambda e Amazon Bedrock* 