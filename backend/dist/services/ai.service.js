"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
const db_service_js_1 = require("./db.service.js");
dotenv_1.default.config();
const SYSTEM_INSTRUCTION = `You are an expert Lost & Found Matching AI for a smart campus system. Your primary directive is to analyze two items (one 'Lost', one 'Found') and determine the probability that they are the exact same physical object.
You must be highly analytical. Consider visual characteristics from images (color, wear and tear, branding), textual descriptions, and the logic of time and location (e.g., an item cannot be found before it was lost).
Be objective and conservative in your scoring. Only assign a score above 85% if there are highly specific unique identifiers present in both.`;
class AIService {
    static client = null;
    /**
     * Initialize or retrieve the singleton GoogleGenAI client
     */
    static getClient() {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return null;
        }
        if (!this.client) {
            this.client = new genai_1.GoogleGenAI({ apiKey });
        }
        return this.client;
    }
    /**
     * Helper to download or convert an image URL / base64 string to inlineData for Gemini
     */
    static async prepareImagePart(imageUrl) {
        try {
            if (!imageUrl)
                return null;
            // Handle base64 Data URL directly
            if (imageUrl.startsWith('data:image/')) {
                const matches = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
                if (matches && matches[1] && matches[2]) {
                    return {
                        inlineData: {
                            mimeType: matches[1],
                            data: matches[2],
                        },
                    };
                }
            }
            // Handle standard HTTP / HTTPS URLs by fetching bytes
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for image fetching
                const response = await fetch(imageUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'CampusLostAndFound-AI/1.0',
                    },
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    console.warn(`Failed to fetch image for AI matching (${response.status}): ${imageUrl}`);
                    return null;
                }
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Data = buffer.toString('base64');
                return {
                    inlineData: {
                        mimeType: contentType.split(';')[0] || 'image/jpeg',
                        data: base64Data,
                    },
                };
            }
        }
        catch (err) {
            console.warn(`Image fetch warning for URL [${imageUrl}]:`, err.message);
        }
        return null;
    }
    /**
     * Compares a Lost item and a Found item using Gemini 2.5 Flash
     * Guaranteed to produce structured JSON matching confidence_score & explanation
     */
    static async compareItems(lostItem, foundItem) {
        const userPrompt = `Compare the following LOST item with the FOUND item.

LOST ITEM:
Title: ${lostItem.title}
Description: ${lostItem.description}
Location: ${lostItem.location}
Time: ${lostItem.event_time}
Image URL: ${lostItem.image_url}

FOUND ITEM:
Title: ${foundItem.title}
Description: ${foundItem.description}
Location: ${foundItem.location}
Time: ${foundItem.event_time}
Image URL: ${foundItem.image_url}

Analyze the visual and textual data. Calculate a confidence score (0-100) and provide a concise explanation of your reasoning.`;
        const ai = this.getClient();
        if (!ai) {
            console.info('GEMINI_API_KEY is not configured or empty. Using intelligent heuristic matching engine.');
            return this.heuristicComparison(lostItem, foundItem);
        }
        try {
            // Prepare multimodal parts (multimodal image data + text prompt)
            const contentsPayload = [];
            const [lostImagePart, foundImagePart] = await Promise.all([
                this.prepareImagePart(lostItem.image_url),
                this.prepareImagePart(foundItem.image_url),
            ]);
            if (lostImagePart) {
                contentsPayload.push({ text: 'Image for LOST item:' });
                contentsPayload.push(lostImagePart);
            }
            if (foundImagePart) {
                contentsPayload.push({ text: 'Image for FOUND item:' });
                contentsPayload.push(foundImagePart);
            }
            contentsPayload.push({ text: userPrompt });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contentsPayload,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            confidence_score: {
                                type: genai_1.Type.INTEGER,
                                description: 'Probability from 0 to 100 that these two records represent the exact same item.',
                            },
                            explanation: {
                                type: genai_1.Type.STRING,
                                description: 'A 2-3 sentence logical explanation of why they match or do not match, referencing specific visual or textual details.',
                            },
                        },
                        required: ['confidence_score', 'explanation'],
                    },
                },
            });
            const responseText = response.text?.trim();
            if (!responseText) {
                throw new Error('Received empty response from Gemini model');
            }
            const parsed = JSON.parse(responseText);
            // Clamp confidence score between 0 and 100
            parsed.confidence_score = Math.max(0, Math.min(100, Math.round(parsed.confidence_score)));
            return parsed;
        }
        catch (error) {
            console.error('Gemini API call failed, falling back to heuristic engine:', error.message);
            return this.heuristicComparison(lostItem, foundItem);
        }
    }
    /**
     * Automated AI Matching Engine:
     * Compares a newly submitted or requested item against candidate counterparts in the database,
     * updates the database with AI scores and explanations, and returns the matches.
     */
    static async runMatchingEngineForItem(targetItem) {
        const candidates = await db_service_js_1.DbService.getCandidateItemsForMatching(targetItem, 6);
        const matchesResult = [];
        // Process comparisons in parallel with a controlled concurrency limit
        const comparisonPromises = candidates.map(async (candidate) => {
            try {
                const lostItem = targetItem.report_type === 'lost' ? targetItem : candidate;
                const foundItem = targetItem.report_type === 'found' ? targetItem : candidate;
                const aiOutput = await this.compareItems(lostItem, foundItem);
                // Persist to item_matches in PostgreSQL
                await db_service_js_1.DbService.saveMatch(lostItem.id, foundItem.id, aiOutput.confidence_score, aiOutput.explanation);
                matchesResult.push({
                    candidateId: candidate.id,
                    confidence_score: aiOutput.confidence_score,
                    explanation: aiOutput.explanation,
                });
            }
            catch (err) {
                console.error(`Error comparing item ${targetItem.id} with candidate ${candidate.id}:`, err);
            }
        });
        await Promise.all(comparisonPromises);
        return {
            processedCount: candidates.length,
            matches: matchesResult,
        };
    }
    /**
     * High-accuracy heuristic fallback in case of no API key or network outages
     */
    static heuristicComparison(lost, found) {
        let score = 0;
        const reasons = [];
        // Category match
        if (lost.category.toLowerCase() === found.category.toLowerCase()) {
            score += 35;
            reasons.push(`both categorized as ${lost.category}`);
        }
        else {
            reasons.push(`categories differ (${lost.category} vs ${found.category})`);
        }
        // Token analysis
        const tokenize = (str) => str
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2);
        const lostTokens = new Set([...tokenize(lost.title), ...tokenize(lost.description)]);
        const foundTokens = new Set([...tokenize(found.title), ...tokenize(found.description)]);
        const intersection = [];
        lostTokens.forEach((t) => {
            if (foundTokens.has(t))
                intersection.push(t);
        });
        const tokenOverlapScore = Math.min(35, intersection.length * 7);
        score += tokenOverlapScore;
        if (intersection.length > 0) {
            reasons.push(`matching keywords: "${intersection.slice(0, 4).join(', ')}"`);
        }
        // Location proximity heuristics
        const lostLoc = lost.location.toLowerCase();
        const foundLoc = found.location.toLowerCase();
        const locOverlap = tokenize(lostLoc).filter((w) => tokenize(foundLoc).includes(w));
        if (lostLoc === foundLoc) {
            score += 25;
            reasons.push(`discovered at the exact same campus location (${lost.location})`);
        }
        else if (locOverlap.length > 0) {
            score += 15;
            reasons.push(`located in nearby campus vicinity (${lost.location} & ${found.location})`);
        }
        // Temporal timeline consistency
        const lostTime = new Date(lost.event_time).getTime();
        const foundTime = new Date(found.event_time).getTime();
        if (!isNaN(lostTime) && !isNaN(foundTime)) {
            if (foundTime >= lostTime) {
                score += 5;
            }
            else {
                // Item found before it was lost - highly improbable
                score = Math.max(0, score - 30);
                reasons.push('timeline discrepancy (item reported found prior to lost timestamp)');
            }
        }
        const finalScore = Math.max(5, Math.min(95, score));
        const explanation = `Heuristic evaluation: Calculated ${finalScore}% match probability based on ${reasons.join('; ')}.`;
        return {
            confidence_score: finalScore,
            explanation,
        };
    }
}
exports.AIService = AIService;
