// lib/aiParser.ts - HuggingFace Chat Completions Implementation

interface ParsedSearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxBudget?: number;
  preferences?: {
    accommodation_type?: string;
    activity_level?: string;
    meal_preference?: string;
    transport_preference?: string;
  };
  confidence_score: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class AISearchParser {
  private apiKey: string;
  private baseUrl: string = 'https://router.huggingface.co/v1/chat/completions';
  
  // Modelli testati che funzionano con Chat Completions
  private models = [
    'openai/gpt-oss-120b:cerebras',  // Testato e funzionante!
    'meta-llama/Llama-3.2-3B-Instruct',
    'microsoft/Phi-3-mini-4k-instruct',
    'google/gemma-2-2b-it'
  ];

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ HUGGINGFACE_API_KEY non trovata');
    }
  }

  async parseSearchQuery(query: string): Promise<ParsedSearchParams> {
    console.log('🤗 HuggingFace Chat Completions - Parsing:', query.substring(0, 50) + '...');

    if (!this.apiKey || process.env.USE_MOCK_AI === 'true') {
      console.log('📝 Usando Mock Parser');
      return this.mockParsing(query);
    }

    // Prova i modelli in ordine di preferenza
    for (const model of this.models) {
      try {
        console.log(`🔄 Tentativo con ${model}...`);
        const result = await this.callChatCompletion(model, query);
        
        if (result && result.confidence_score > 0.3) {
          console.log(`✅ Successo con ${model}, confidence: ${result.confidence_score}`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${model} fallito:`, error);
        continue;
      }
    }

    // Fallback finale
    console.warn('⚠️ Tutti i modelli HuggingFace falliti, usando Mock Parser');
    return this.mockParsing(query);
  }

  private async callChatCompletion(model: string, query: string): Promise<ParsedSearchParams | null> {
    const messages = [
      {
        role: 'system',
        content: this.buildSystemPrompt()
      },
      {
        role: 'user',
        content: `Estrai i parametri di viaggio da questa richiesta: "${query}"`
      }
    ];

    const payload = {
      model,
      messages,
      stream: false,
      max_tokens: 300,
      temperature: 0.1
    };

    console.log('📤 Chat Completion Request:', { 
      model, 
      query: query.substring(0, 100) + '...'
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}:`, errorText);
        
        // Gestione errori specifici
        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        } else if (response.status === 503) {
          throw new Error('MODEL_LOADING');
        } else if (response.status === 404) {
          throw new Error('MODEL_NOT_FOUND');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR');
        }
        
        throw new Error(`HTTP_${response.status}`);
      }

      const data: ChatCompletionResponse = await response.json();
      console.log('📥 Chat Response:', {
        model,
        tokens: data.usage?.total_tokens,
        finish_reason: data.choices[0]?.finish_reason
      });

      if (!data.choices || data.choices.length === 0) {
        console.warn('⚠️ No choices in response');
        return null;
      }

      const content = data.choices[0].message.content;
      console.log('📄 Raw response content:', content);

      return this.parseAIResponse(content, query);

    } catch (error: any) {
      console.error(`❌ Error calling ${model}:`, error.message);
      throw error;
    }
  }

  private buildSystemPrompt(): string {
    return `You are a travel parameter extraction AI. Extract travel information from user requests and respond with JSON only.

Extract these parameters:
- destination: city name in Italian (Roma, Milano, Parigi, Barcellona, Amsterdam, Londra) or null
- checkIn: check-in date in YYYY-MM-DD format or null  
- checkOut: check-out date in YYYY-MM-DD format or null
- guests: number of people (integer, default 2)
- maxBudget: maximum budget in euros (integer) or null
- preferences: object with:
  * accommodation_type: "hotel" | "apartment" | "hostel" | "resort" | null
  * activity_level: "relax" | "adventure" | "culture" | "nightlife" | null
  * meal_preference: "restaurant" | "local" | "hotel" | "self_catering" | null
  * transport_preference: "comfort" | "economy" | "business" | null
- confidence_score: your confidence in this interpretation (0.0 to 1.0)

Response example:
{
  "destination": "Parigi",
  "checkIn": null,
  "checkOut": null,
  "guests": 2,
  "maxBudget": 800,
  "preferences": {
    "accommodation_type": "hotel",
    "activity_level": "relax",
    "meal_preference": "restaurant",
    "transport_preference": "comfort"
  },
  "confidence_score": 0.85
}

Respond with valid JSON only, no additional text.`;
  }

  private parseAIResponse(response: string, originalQuery: string): ParsedSearchParams {
    try {
      console.log('🔍 Parsing AI response...');

      // Pulizia della risposta - rimuovi eventuali backticks o testo extra
      let cleanResponse = response.trim();
      
      // Rimuovi markdown code blocks se presenti
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      // Trova il JSON nella risposta
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response');
        return this.mockParsing(originalQuery);
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);
      console.log('✅ Parsed JSON:', parsed);

      return this.validateAndNormalize(parsed, originalQuery);

    } catch (error) {
      console.warn('⚠️ Error parsing AI response:', error);
      console.log('Raw response was:', response);
      
      // Fallback: prova estrazione semplice con regex
      return this.extractWithRegex(response, originalQuery);
    }
  }

  private validateAndNormalize(parsed: any, originalQuery: string): ParsedSearchParams {
    // Mappa destinazioni ai nomi corretti
    const destinationMap: { [key: string]: string } = {
      'paris': 'Parigi', 'parigi': 'Parigi',
      'rome': 'Roma', 'roma': 'Roma', 
      'milan': 'Milano', 'milano': 'Milano',
      'barcelona': 'Barcellona', 'barcellona': 'Barcellona',
      'amsterdam': 'Amsterdam',
      'london': 'Londra', 'londra': 'Londra'
    };

    // Normalizza destinazione
    let destination = parsed.destination;
    if (destination) {
      const normalized = destinationMap[destination.toLowerCase()] || destination;
      destination = normalized;
    }

    // Valida e normalizza budget
    let budget = parsed.maxBudget;
    if (typeof budget === 'string') {
      budget = parseInt(budget.replace(/[^\d]/g, ''));
    }
    if (budget && (budget < 50 || budget > 10000)) {
      budget = null;
    }

    // Valida guests
    let guests = parsed.guests || 2;
    if (typeof guests === 'string') {
      guests = parseInt(guests);
    }
    guests = Math.min(Math.max(guests, 1), 8);

    // Valida date
    const checkIn = this.validateDate(parsed.checkIn);
    const checkOut = this.validateDate(parsed.checkOut);

    // Valida confidence
    let confidence = parsed.confidence_score || 0.7;
    if (typeof confidence === 'string') {
      confidence = parseFloat(confidence);
    }
    confidence = Math.min(Math.max(confidence, 0), 1);

    // Normalizza preferences
    const preferences = {
      accommodation_type: this.normalizeAccommodationType(parsed.preferences?.accommodation_type),
      activity_level: this.normalizeActivityLevel(parsed.preferences?.activity_level, originalQuery),
      meal_preference: this.normalizeMealPreference(parsed.preferences?.meal_preference),
      transport_preference: this.normalizeTransportPreference(parsed.preferences?.transport_preference, originalQuery)
    };

    return {
      destination,
      checkIn,
      checkOut,
      guests,
      maxBudget: budget,
      preferences,
      confidence_score: confidence
    };
  }

  private validateDate(dateStr: string): string | null {
    if (!dateStr || dateStr === 'null') return null;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      
      // Deve essere nel futuro (almeno oggi)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return null;
      
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private normalizeAccommodationType(type: string): string | null {
    if (!type) return null;
    
    const typeMap: { [key: string]: string } = {
      'hotel': 'hotel',
      'hotel elegante': 'hotel',
      'elegant hotel': 'hotel',
      'apartment': 'apartment',
      'appartamento': 'apartment', 
      'hostel': 'hostel',
      'ostello': 'hostel',
      'resort': 'resort'
    };
    
    return typeMap[type.toLowerCase()] || 'hotel';
  }

  private normalizeActivityLevel(level: string, query: string): string | null {
    if (level) {
      const levelMap: { [key: string]: string } = {
        'relax': 'relax',
        'romantico': 'relax',
        'romantic': 'relax',
        'adventure': 'adventure',
        'avventura': 'adventure',
        'culture': 'culture',
        'cultura': 'culture',
        'nightlife': 'nightlife',
        'vita notturna': 'nightlife'
      };
      
      const normalized = levelMap[level.toLowerCase()];
      if (normalized) return normalized;
    }
    
    // Fallback: analizza la query originale
    const queryLower = query.toLowerCase();
    if (queryLower.includes('romantico') || queryLower.includes('relax')) return 'relax';
    if (queryLower.includes('cultura') || queryLower.includes('museo') || queryLower.includes('storico')) return 'culture';
    if (queryLower.includes('avventura') || queryLower.includes('sport')) return 'adventure';
    if (queryLower.includes('nightlife') || queryLower.includes('discoteca')) return 'nightlife';
    
    return null;
  }

  private normalizeMealPreference(meal: string): string | null {
    if (!meal) return null;
    
    const mealMap: { [key: string]: string } = {
      'restaurant': 'restaurant',
      'ristorante': 'restaurant',
      'local': 'local',
      'locale': 'local',
      'hotel': 'hotel',
      'self_catering': 'self_catering',
      'cucina': 'self_catering'
    };
    
    return mealMap[meal.toLowerCase()] || null;
  }

  private normalizeTransportPreference(transport: string, query: string): string | null {
    if (transport) {
      const transportMap: { [key: string]: string } = {
        'comfort': 'comfort',
        'economy': 'economy',
        'economico': 'economy',
        'business': 'business',
        'lusso': 'business'
      };
      
      const normalized = transportMap[transport.toLowerCase()];
      if (normalized) return normalized;
    }
    
    // Fallback: analizza query originale
    const queryLower = query.toLowerCase();
    if (queryLower.includes('lusso') || queryLower.includes('business') || queryLower.includes('elegante')) return 'business';
    if (queryLower.includes('economico') || queryLower.includes('budget') || queryLower.includes('cheap')) return 'economy';
    
    return 'comfort'; // Default
  }

  private extractWithRegex(text: string, originalQuery: string): ParsedSearchParams {
    console.log('🔧 Fallback: estrazione regex da:', text.substring(0, 100));
    
    // Fallback al mock parsing se il JSON parsing fallisce
    return this.mockParsing(originalQuery);
  }

  // Mock Parser per fallback
  private async mockParsing(query: string): Promise<ParsedSearchParams> {
    console.log('📝 Mock parsing per:', query.substring(0, 50));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const queryLower = query.toLowerCase();
    
    return {
      destination: this.extractDestinationMock(queryLower),
      guests: this.extractGuestsMock(query),
      maxBudget: this.extractBudgetMock(query),
      checkIn: this.extractCheckInMock(queryLower),
      checkOut: this.extractCheckOutMock(queryLower),
      preferences: this.extractPreferencesMock(queryLower),
      confidence_score: this.calculateMockConfidence(queryLower)
    };
  }

  // Mock helper methods
  private extractDestinationMock(query: string): string | null {
    const destinations = {
      'roma': 'Roma', 'rome': 'Roma',
      'milano': 'Milano', 'milan': 'Milano',
      'parigi': 'Parigi', 'paris': 'Parigi',
      'barcellona': 'Barcellona', 'barcelona': 'Barcellona',
      'amsterdam': 'Amsterdam',
      'londra': 'Londra', 'london': 'Londra'
    };

    for (const [key, value] of Object.entries(destinations)) {
      if (query.includes(key)) return value;
    }
    return null;
  }

  private extractGuestsMock(query: string): number {
    const guestsMatch = query.match(/(\d+)\s*(persone?|person[ie]|people)/i);
    if (guestsMatch) return Math.min(parseInt(guestsMatch[1]), 8);
    
    if (query.toLowerCase().includes('coppia') || query.toLowerCase().includes('romantic')) return 2;
    if (query.toLowerCase().includes('famiglia') || query.toLowerCase().includes('family')) return 4;
    return 2;
  }

  private extractBudgetMock(query: string): number | null {
    const patterns = [
      /(\d+)\s*€/,
      /budget\s*(\d+)/i,
      /intorno\s*(\d+)/i,
      /circa\s*(\d+)/i,
      /max\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        const amount = parseInt(match[1]);
        return amount >= 100 && amount <= 5000 ? amount : null;
      }
    }
    return null;
  }

  private extractCheckInMock(query: string): string | null {
    if (query.includes('weekend')) {
      const now = new Date();
      const nextFriday = new Date(now);
      nextFriday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
      return nextFriday.toISOString().split('T')[0];
    }
    return null;
  }

  private extractCheckOutMock(query: string): string | null {
    const checkIn = this.extractCheckInMock(query);
    if (checkIn) {
      const date = new Date(checkIn);
      date.setDate(date.getDate() + 2);
      return date.toISOString().split('T')[0];
    }
    return null;
  }

  private extractPreferencesMock(query: string): any {
    return {
      accommodation_type: query.includes('hotel') ? 'hotel' : 
                         query.includes('appartament') ? 'apartment' : null,
      activity_level: query.includes('romantico') ? 'relax' : 
                     query.includes('cultura') ? 'culture' : null,
      meal_preference: query.includes('ristorante') ? 'restaurant' : null,
      transport_preference: query.includes('lusso') || query.includes('elegante') ? 'business' : 'comfort'
    };
  }

  private calculateMockConfidence(query: string): number {
    let confidence = 0.4;
    if (this.extractDestinationMock(query)) confidence += 0.3;
    if (this.extractBudgetMock(query)) confidence += 0.2;
    if (query.length > 30) confidence += 0.1;
    return Math.min(confidence, 0.85);
  }
}