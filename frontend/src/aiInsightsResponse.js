const INSIGHT_TEXT_FIELDS = [
    "summary",
    "sales_insights",
    "inventory_insights",
];

export function classifyAIInsightsResponse(payload) {
    if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        !Object.prototype.hasOwnProperty.call(payload, "ai_insights")
    ) {
        return "invalid";
    }

    const insights = payload.ai_insights;

    if (insights == null) {
        return "empty";
    }

    if (
        typeof insights !== "object" ||
        Array.isArray(insights) ||
        !INSIGHT_TEXT_FIELDS.every((field) => typeof insights[field] === "string") ||
        !Array.isArray(insights.recommendations) ||
        !insights.recommendations.every((item) => typeof item === "string")
    ) {
        return "invalid";
    }

    const hasText = INSIGHT_TEXT_FIELDS.some((field) => insights[field].trim());
    const hasRecommendation = insights.recommendations.some((item) => item.trim());

    return hasText || hasRecommendation ? "valid" : "empty";
}

export function getAIInsightsErrorMessage(status, backendMessage) {
    if (status === 401) {
        return "Your session has expired. Sign in again to view AI insights.";
    }

    if (status === 403) {
        return "Your account is not authorized to view AI insights.";
    }

    if (backendMessage) {
        return backendMessage;
    }

    if (status) {
        return `The AI Insights service returned an error (HTTP ${status}). Try again later or contact support.`;
    }

    return "Unable to reach the AI Insights service. Check your connection and try again.";
}
