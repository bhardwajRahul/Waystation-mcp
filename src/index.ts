#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const API_BASE = process.env.WAY_BASE || "https://waystation.ai";

const WAY_KEY = process.env.WAY_KEY || (process.argv.length > 2 ? process.argv[2] : null);

console.error(`API_BASE: ${API_BASE}`);

// Create server instance
const server = new Server({name: "waystation",version: "0.2.0"}, {capabilities: { tools: {} }});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    const response = await fetch(`${API_BASE}/tools/list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!WAY_KEY) {
        return { error: true, content: [{ type: "text", text: "WAY_KEY not set" }] };
    }

    const response = await fetch(`${API_BASE}/tools/call`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': WAY_KEY
        },
        body: JSON.stringify(request)
    });

    return await response.json();
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("WayStation MCP Server running on stdio");
}
  
main().catch(console.error);