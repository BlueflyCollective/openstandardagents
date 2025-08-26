export interface TokenEstimationResult {
    text: string;
    model: string;
    estimated_tokens: number;
    estimated_cost_usd: number;
    breakdown: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
    };
    pricing: {
        input_cost_per_1k: number;
        output_cost_per_1k: number;
        currency: string;
    };
    recommendations: string[];
}

// Pricing data (as of 2024 - update as needed)
const MODEL_PRICING = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'llama-2-70b': { input: 0.0007, output: 0.0009 },
    'llama-3-70b': { input: 0.0007, output: 0.0009 },
    'default': { input: 0.002, output: 0.002 }
};

export async function estimateTokens(
    text: string,
    model: string = 'gpt-4'
): Promise<TokenEstimationResult> {
    // Simple token estimation (rough approximation)
    // In production, you'd use actual tokenizers for each model
    const estimatedTokens = estimateTokenCount(text);

    // Assume 80% input, 20% output for estimation
    const inputTokens = Math.floor(estimatedTokens * 0.8);
    const outputTokens = Math.floor(estimatedTokens * 0.2);
    const totalTokens = inputTokens + outputTokens;

    // Get pricing for the model
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING.default;

    // Calculate costs
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;

    const result: TokenEstimationResult = {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        model,
        estimated_tokens: totalTokens,
        estimated_cost_usd: totalCost,
        breakdown: {
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens
        },
        pricing: {
            input_cost_per_1k: pricing.input,
            output_cost_per_1k: pricing.output,
            currency: 'USD'
        },
        recommendations: generateRecommendations(totalTokens, totalCost, model)
    };

    return result;
}

function estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified approach - real tokenizers are more complex

    // Remove extra whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    // Basic character count
    let tokenCount = Math.ceil(cleanedText.length / 4);

    // Adjust for special characters and punctuation
    const specialChars = (cleanedText.match(/[^\w\s]/g) || []).length;
    tokenCount += Math.ceil(specialChars * 0.5);

    // Adjust for numbers (often tokenized separately)
    const numbers = (cleanedText.match(/\d+/g) || []).length;
    tokenCount += numbers;

    // Adjust for URLs and emails
    const urls = (cleanedText.match(/https?:\/\/[^\s]+/g) || []).length;
    const emails = (cleanedText.match(/[^\s]+@[^\s]+\.[^\s]+/g) || []).length;
    tokenCount += (urls + emails) * 2;

    return Math.max(tokenCount, 1); // Minimum 1 token
}

function generateRecommendations(tokens: number, cost: number, model: string): string[] {
    const recommendations: string[] = [];

    if (tokens > 100000) {
        recommendations.push('Consider breaking down large requests into smaller chunks');
        recommendations.push('Use streaming responses for better user experience');
    }

    if (cost > 1.0) {
        recommendations.push('High cost detected - consider using a more cost-effective model');
        recommendations.push('Implement caching for repeated requests');
    }

    if (tokens > 50000) {
        recommendations.push('Large token count - ensure your model supports this context length');
    }

    if (model.includes('gpt-4') && cost > 0.5) {
        recommendations.push('Consider using GPT-3.5-turbo for cost optimization');
    }

    if (tokens < 100) {
        recommendations.push('Low token count - you may be able to batch multiple requests');
    }

    recommendations.push('Monitor token usage regularly to optimize costs');
    recommendations.push('Implement token usage tracking and alerts');

    return recommendations;
}
