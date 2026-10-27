import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError } from "axios";

import api from "../src/api.js";

function makeError(config, status = 401) {
    const response = {
        data: { detail: "Unauthorized" },
        status,
        statusText: "Unauthorized",
        headers: {},
        config,
    };

    return new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, config, null, response);
}

function makeResponse(config, data) {
    return {
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        request: {},
    };
}

function setAuthStorage(values = {}) {
    const storage = new Map(Object.entries(values));
    globalThis.localStorage = {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, String(value)),
        removeItem: (key) => storage.delete(key),
    };

    globalThis.window = { location: { href: "" } };
    return storage;
}

test("refreshes an expired access token and retries the original request", async () => {
    const storage = setAuthStorage({
        access_token: "expired-access",
        refresh_token: "valid-refresh",
    });
    let refreshRequests = 0;
    const adapter = async (config) => {
        if (config.url.includes("/auth/refresh/")) {
            refreshRequests += 1;
            return makeResponse(config, { access: "new-access" });
        }

        if (config.headers.Authorization === "Bearer new-access") {
            return makeResponse(config, { result: "ok" });
        }

        throw makeError(config);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const response = await api.get("/test-resource/");

    assert.deepEqual(response.data, { result: "ok" });
    assert.equal(refreshRequests, 1);
    assert.equal(storage.get("access_token"), "new-access");
    assert.equal(storage.get("refresh_token"), "valid-refresh");
});

test("does not refresh repeatedly when the retried request still returns 401", async () => {
    setAuthStorage({
        access_token: "expired-access",
        refresh_token: "valid-refresh",
    });
    let refreshRequests = 0;
    let resourceRequests = 0;
    const adapter = async (config) => {
        if (config.url.includes("/auth/refresh/")) {
            refreshRequests += 1;
            return makeResponse(config, { access: "new-access" });
        }

        resourceRequests += 1;
        throw makeError(config);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await assert.rejects(api.get("/test-resource/"));

    assert.equal(refreshRequests, 1);
    assert.equal(resourceRequests, 2);
});

test("shares one refresh request across concurrent expired requests", async () => {
    setAuthStorage({
        access_token: "expired-access",
        refresh_token: "valid-refresh",
    });
    let refreshRequests = 0;
    const adapter = async (config) => {
        if (config.url.includes("/auth/refresh/")) {
            refreshRequests += 1;
            await new Promise((resolve) => setTimeout(resolve, 10));
            return makeResponse(config, { access: "new-access" });
        }

        if (config.headers.Authorization === "Bearer new-access") {
            return makeResponse(config, { result: config.url });
        }

        throw makeError(config);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const responses = await Promise.all([
        api.get("/first-resource/"),
        api.get("/second-resource/"),
    ]);

    assert.equal(responses.length, 2);
    assert.equal(refreshRequests, 1);
});

test("does not recursively refresh after refresh failure", async () => {
    const storage = setAuthStorage({
        access_token: "expired-access",
        refresh_token: "expired-refresh",
        user: "{}",
    });
    let refreshRequests = 0;
    const adapter = async (config) => {
        if (config.url.includes("/auth/refresh/")) {
            refreshRequests += 1;
            throw makeError(config);
        }

        throw makeError(config);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await assert.rejects(api.get("/test-resource/"), AxiosError);

    assert.equal(refreshRequests, 1);
    assert.equal(storage.has("access_token"), false);
    assert.equal(storage.has("refresh_token"), false);
    assert.equal(storage.has("user"), false);
    assert.equal(window.location.href, "/");
});
