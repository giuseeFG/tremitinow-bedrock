import { handler } from './index.js';

// Test event per la Lambda function
const testEvent = {
  httpMethod: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Orari traghetti domani da Termoli',
    history: []
  })
};

// Test OPTIONS event
const optionsEvent = {
  httpMethod: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test health check
const healthEvent = {
  httpMethod: 'GET',
  path: '/health',
  headers: {}
};

async function runTests() {
  console.log('🧪 Avvio test TremitiBot Lambda...\n');

  try {
    // Test 1: OPTIONS request
    console.log('📋 Test 1: OPTIONS request');
    const optionsResult = await handler(optionsEvent);
    console.log('Status:', optionsResult.statusCode);
    console.log('Headers:', optionsResult.headers);
    console.log('Body:', optionsResult.body);
    console.log('✅ OPTIONS test completato\n');

    // Test 2: Health check
    console.log('📋 Test 2: Health check');
    const healthResult = await handler(healthEvent);
    console.log('Status:', healthResult.statusCode);
    console.log('Body:', healthResult.body);
    console.log('✅ Health check completato\n');

    // Test 3: Chat request
    console.log('📋 Test 3: Chat request');
    const chatResult = await handler(testEvent);
    console.log('Status:', chatResult.statusCode);
    console.log('Headers:', chatResult.headers);
    
    const responseBody = JSON.parse(chatResult.body);
    console.log('Success:', responseBody.success);
    if (responseBody.success) {
      console.log('Message length:', responseBody.message?.length || 0);
      console.log('Usage:', responseBody.usage);
      console.log('Timestamp:', responseBody.timestamp);
    } else {
      console.log('Error:', responseBody.error);
      console.log('Fallback:', responseBody.fallbackMessage);
    }
    console.log('✅ Chat test completato\n');

    // Test 4: Invalid JSON
    console.log('📋 Test 4: Invalid JSON');
    const invalidEvent = {
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    };
    const invalidResult = await handler(invalidEvent);
    console.log('Status:', invalidResult.statusCode);
    console.log('Body:', invalidResult.body);
    console.log('✅ Invalid JSON test completato\n');

    // Test 5: Missing message
    console.log('📋 Test 5: Missing message');
    const missingEvent = {
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: []
      })
    };
    const missingResult = await handler(missingEvent);
    console.log('Status:', missingResult.statusCode);
    console.log('Body:', missingResult.body);
    console.log('✅ Missing message test completato\n');

    console.log('🎉 Tutti i test completati con successo!');

  } catch (error) {
    console.error('❌ Errore durante i test:', error);
  }
}

// Esegui i test
runTests(); 