import dotenv from 'dotenv';
dotenv.config();

export const bedrockConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  modelConfig: {
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: parseInt(process.env.BEDROCK_MAX_TOKENS) || 2000,
    temperature: parseFloat(process.env.BEDROCK_TEMPERATURE) || 0.3,
    topP: 0.9
  }
};

export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};