import { GoogleGenAI, Type } from "@google/genai";

// CORRECTION CRITIQUE POUR VERCEL :
// Remplacement de process.env.API_KEY par import.meta.env.VITE_API_KEY
// "process" n'est pas défini dans le navigateur, ce qui cause l'écran blanc.
const apiKey = (import.meta as any).env.VITE_API_KEY || 'placeholder_key_to_avoid_crash';

const ai = new GoogleGenAI({ apiKey: apiKey });

// Helper to get schema for a single card structure
const cardSchema = {
  type: Type.OBJECT,
  properties: {
    character: { type: Type.STRING },
    pinyin: { type: Type.STRING },
    translation: { type: Type.STRING },
    example_sentence: { type: Type.STRING },
  },
  required: ["character", "pinyin", "translation", "example_sentence"]
};

export const generateFlashcardContent = async (character: string) => {
  // Updated model to the recommended one for text tasks
  const model = 'gemini-3-flash-preview';

  // Prevent API call if key is missing
  if (apiKey === 'placeholder_key_to_avoid_crash') {
    console.warn("API Key is missing. Please set VITE_API_KEY.");
    return null;
  }

  const prompt = `
    Analyse le caractère chinois : ${character}.
    Fournis le Pinyin, la traduction en Français, et une phrase d'exemple simple (Chinois + Traduction Française).
    Réponds strictement en JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateDailyLesson = async (excludeCharacters: string[] = []) => {
  // Updated model to the recommended one for text tasks
  const model = 'gemini-3-flash-preview';

  // Prevent API call if key is missing
  if (apiKey === 'placeholder_key_to_avoid_crash') {
    console.warn("API Key is missing. Please set VITE_API_KEY.");
    return [];
  }

  // On limite la liste d'exclusion pour ne pas surcharger le prompt si la base devient énorme,
  // mais pour une classe c'est généralement ok.
  const exclusionList = excludeCharacters.join(', ');

  const prompt = `
    Agis comme un professeur de chinois expert pour une classe francophone.
    Génère une "Leçon du jour" contenant exactement 3 mots de vocabulaire chinois distincts.
    
    CONTRAINTES DE DIFFICULTÉ (Strictes) :
    1. Premier mot : **FACILE** (Niveau HSK 1 ou 2). Basique et courant.
    2. Deuxième mot : **MOYEN** (Niveau HSK 3). Intermédiaire.
    3. Troisième mot : **DIFFICILE** (Niveau HSK 4 ou 5). Avancé ou littéraire.

    CONTRAINTES DE LANGUE :
    - Toutes les traductions et explications DOIVENT être en **FRANÇAIS**.
    - La phrase d'exemple doit être en caractères chinois suivie de sa traduction française.

    CONTRAINTES D'UNICITÉ :
    - N'utilise PAS les caractères suivants (ils existent déjà) : [${exclusionList}]
    
    Pour chaque mot fournis un objet JSON avec :
    - character (Hanzi)
    - pinyin
    - translation (définition en Français)
    - example_sentence (Phrase en chinois + Traduction française)
    
    Retourne un Tableau JSON de 3 objets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: cardSchema
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Daily Lesson Error:", error);
    return [];
  }
};