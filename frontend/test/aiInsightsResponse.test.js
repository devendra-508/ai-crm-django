import assert from "node:assert/strict";
import test from "node:test";

import {
    classifyAIInsightsResponse,
    getAIInsightsErrorMessage,
} from "../src/aiInsightsResponse.js";

const validInsights = {
    summary: "Sales increased this month.",
    sales_insights: "Two products account for most sales.",
    inventory_insights: "One product is below its stock threshold.",
    recommendations: ["Review the low stock item."],
};

test("classifies a valid AI Insights API response", () => {
    assert.equal(
        classifyAIInsightsResponse({ ai_insights: validInsights }),
        "valid"
    );
});

test("classifies null and blank insights as empty", () => {
    assert.equal(classifyAIInsightsResponse({ ai_insights: null }), "empty");
    assert.equal(
        classifyAIInsightsResponse({
            ai_insights: {
                summary: " ",
                sales_insights: "",
                inventory_insights: "",
                recommendations: [],
            },
        }),
        "empty"
    );
});

test("classifies a successful response with an unexpected contract as invalid", () => {
    assert.equal(
        classifyAIInsightsResponse({ message: "OK", response: "Legacy payload" }),
        "invalid"
    );
});

test("classifies malformed insights fields as invalid", () => {
    assert.equal(
        classifyAIInsightsResponse({ ai_insights: { summary: "Incomplete" } }),
        "invalid"
    );
});

test("provides distinct authentication and permission messages", () => {
    assert.match(getAIInsightsErrorMessage(401), /session has expired/i);
    assert.match(getAIInsightsErrorMessage(403), /not authorized/i);
});

test("preserves backend AI-provider errors and distinguishes network failures", () => {
    assert.equal(
        getAIInsightsErrorMessage(502, "AI insights could not be generated."),
        "AI insights could not be generated."
    );
    assert.match(getAIInsightsErrorMessage(503), /HTTP 503/);
    assert.match(getAIInsightsErrorMessage(undefined), /connection/i);
});
