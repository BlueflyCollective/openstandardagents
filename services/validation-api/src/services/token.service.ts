import { encoding_for_model } from 'tiktoken';
import { TokenEstimation } from '../types/oaas';

export class TokenService {
    private gpt4Encoder = encoding_for_model('gpt-4');
    private gpt35Encoder = encoding_for_model('gpt-3.5-turbo');
    private claudeEncoder = encoding_for_model('cl100k_base'); // Claude uses cl100k_base
    private geminiEncoder = encoding_for_model('cl100k_base'); // Gemini approximation

    // Pricing per 1K tokens (as of 2024)
    private readonly PRICING = {
        gpt4: {
            input: 0.03,
            output: 0.06
        },
        gpt35: {
            input: 0.0015,
            output: 0.002
        },
        claude3: {
            input: 0.015,
            output: 0.075
        },
        gemini: {
            input: 0.0005,
            output: 0.0015
        }
    };

    async estimateTokens(text: string): Promise<TokenEstimation> {
        try {
            // Estimate tokens for different models
            const gpt4Tokens = this.gpt4Encoder.encode(text).length;
            const gpt35Tokens = this.gpt35Encoder.encode(text).length;
            const claudeTokens = this.claudeEncoder.encode(text).length;
            const geminiTokens = this.geminiEncoder.encode(text).length;

            // Use average for final count
            const avgTokens = Math.round((gpt4Tokens + gpt35Tokens + claudeTokens + geminiTokens) / 4);

            // Calculate cost estimates (assuming 70% input, 30% output ratio)
            const inputTokens = Math.round(avgTokens * 0.7);
            const outputTokens = Math.round(avgTokens * 0.3);

            const cost_estimate = {
                gpt4: this.calculateCost(inputTokens, outputTokens, this.PRICING.gpt4),
                gpt35: this.calculateCost(inputTokens, outputTokens, this.PRICING.gpt35),
                claude3: this.calculateCost(inputTokens, outputTokens, this.PRICING.claude3),
                gemini: this.calculateCost(inputTokens, outputTokens, this.PRICING.gemini)
            };

            // Generate optimization suggestions
            const optimization_suggestions = this.generateOptimizationSuggestions(text, avgTokens);

            return {
                text,
                tokens: avgTokens,
                cost_estimate,
                optimization_suggestions
            };

        } catch (error) {
            // Fallback estimation using simple word count
            const fallbackTokens = Math.round(text.split(/\s+/).length * 1.3);

            return {
                text,
                tokens: fallbackTokens,
                cost_estimate: {
                    gpt4: fallbackTokens * 0.03 / 1000,
                    gpt35: fallbackTokens * 0.0015 / 1000,
                    claude3: fallbackTokens * 0.015 / 1000,
                    gemini: fallbackTokens * 0.0005 / 1000
                },
                optimization_suggestions: ['Token estimation used fallback method due to encoding error']
            };
        }
    }

    private calculateCost(inputTokens: number, outputTokens: number, pricing: { input: number; output: number }): number {
        const inputCost = (inputTokens / 1000) * pricing.input;
        const outputCost = (outputTokens / 1000) * pricing.output;
        return Math.round((inputCost + outputCost) * 100) / 100; // Round to 2 decimal places
    }

    private generateOptimizationSuggestions(text: string, tokens: number): string[] {
        const suggestions: string[] = [];

        // Check for redundancy
        const words = text.split(/\s+/);
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const redundancyRatio = 1 - (uniqueWords.size / words.length);

        if (redundancyRatio > 0.3) {
            suggestions.push('High redundancy detected - consider removing repetitive phrases');
        }

        // Check for length
        if (tokens > 4000) {
            suggestions.push('Text is very long - consider breaking into smaller chunks');
        }

        // Check for unnecessary words
        const unnecessaryWords = ['very', 'really', 'quite', 'rather', 'somewhat', 'fairly'];
        const hasUnnecessaryWords = unnecessaryWords.some(word =>
            text.toLowerCase().includes(word)
        );

        if (hasUnnecessaryWords) {
            suggestions.push('Remove unnecessary qualifiers (very, really, quite, etc.)');
        }

        // Check for passive voice
        const passiveVoicePatterns = [
            /\bis\s+\w+\s+by\b/gi,
            /\bwas\s+\w+\s+by\b/gi,
            /\bwere\s+\w+\s+by\b/gi,
            /\bbeing\s+\w+\s+by\b/gi
        ];

        const hasPassiveVoice = passiveVoicePatterns.some(pattern => pattern.test(text));
        if (hasPassiveVoice) {
            suggestions.push('Convert passive voice to active voice for clarity and conciseness');
        }

        // Check for long sentences
        const sentences = text.split(/[.!?]+/);
        const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25);
        if (longSentences.length > 0) {
            suggestions.push('Break down long sentences into shorter, clearer ones');
        }

        // Check for technical jargon
        const technicalTerms = ['utilize', 'facilitate', 'implement', 'leverage', 'optimize'];
        const hasTechnicalJargon = technicalTerms.some(term =>
            text.toLowerCase().includes(term)
        );

        if (hasTechnicalJargon) {
            suggestions.push('Replace technical jargon with simpler alternatives (use instead of utilize)');
        }

        // Default suggestions if no specific issues found
        if (suggestions.length === 0) {
            suggestions.push('Text is well-optimized for token usage');
            suggestions.push('Consider using bullet points for lists to improve readability');
        }

        return suggestions;
    }

    async optimizeText(text: string): Promise<{ original: TokenEstimation; optimized: TokenEstimation; savings: number }> {
        const original = await this.estimateTokens(text);

        // Apply basic optimizations
        let optimizedText = text;

        // Remove unnecessary words
        const unnecessaryWords = ['very', 'really', 'quite', 'rather', 'somewhat', 'fairly'];
        unnecessaryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\s+`, 'gi');
            optimizedText = optimizedText.replace(regex, '');
        });

        // Remove extra whitespace
        optimizedText = optimizedText.replace(/\s+/g, ' ').trim();

        // Convert passive voice (basic patterns)
        optimizedText = optimizedText.replace(/\bis\s+(\w+)\s+by\b/gi, '$1 is');
        optimizedText = optimizedText.replace(/\bwas\s+(\w+)\s+by\b/gi, '$1 was');

        const optimized = await this.estimateTokens(optimizedText);
        const savings = Math.round(((original.tokens - optimized.tokens) / original.tokens) * 100);

        return {
            original,
            optimized,
            savings
        };
    }

    // Cleanup method to free encoders
    cleanup(): void {
        this.gpt4Encoder.free();
        this.gpt35Encoder.free();
        this.claudeEncoder.free();
        this.geminiEncoder.free();
    }
}
