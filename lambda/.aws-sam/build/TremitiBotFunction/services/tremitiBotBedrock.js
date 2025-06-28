import { TremitiBot } from './tremitiBot.js';
import { bedrockConfig } from '../config/bedrock.js';
import path from 'path';

export class TremitiBotBedrock {
  constructor() {
    const dataPath = path.join(process.cwd(), 'lambda/data');
    this.bot = new TremitiBot({ dataPath, bedrockConfig });
  }

  async sendMessage(userMessage, conversationHistory = []) {
    return this.bot.sendMessage(userMessage, conversationHistory);
  }
}