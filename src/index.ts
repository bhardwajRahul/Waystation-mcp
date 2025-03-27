#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';

const API_BASE = process.env.WAY_BASE || "https://waystation.ai";

// Function to get platform-specific WayStation paths
function getWayStationPath(fileName?: string): string {
    const basePath = os.platform() === 'win32'
        ? path.join(process.env.APPDATA || '', 'WayStation')
        : path.join(os.homedir(), '.waystation');
    
    return fileName ? path.join(basePath, fileName) : basePath;
}

// Get the token path
const tokenPath = getWayStationPath('token');
let lastTokenModifiedTime: number | null = null;
let tokenKey: string | null = null;

// Function to check if token file has been modified and refresh token if needed
function checkAndRefreshToken(): string | null {
    try {
        // If token file doesn't exist, return current tokenKey
        if (!fs.existsSync(tokenPath)) {
            return tokenKey;
        }

        // Get current file stats
        const stats = fs.statSync(tokenPath);
        const currentModifiedTime = stats.mtimeMs;

        // If this is the first check or the file has been modified
        if (lastTokenModifiedTime === null || currentModifiedTime !== lastTokenModifiedTime) {
            console.error(`Token file changed, refreshing token...`);
            // Read the new token
            tokenKey = fs.readFileSync(tokenPath, 'utf8').trim();
            // Update the last modified time
            lastTokenModifiedTime = currentModifiedTime;
        }

        return tokenKey;
    } catch (error) {
        console.error(`Error checking/refreshing token: ${error instanceof Error ? error.message : String(error)}`);
        return tokenKey;
    }
}

// Initial token load
try {
    if (fs.existsSync(tokenPath)) {
        tokenKey = fs.readFileSync(tokenPath, 'utf8').trim();
        lastTokenModifiedTime = fs.statSync(tokenPath).mtimeMs;
    }
} catch (error) {
    console.error(`Error reading token file: ${error instanceof Error ? error.message : String(error)}`);
}

// WAY_KEY will be dynamically updated before each API call
let WAY_KEY = process.env.WAY_KEY || tokenKey || (process.argv.length > 2 ? process.argv[2] : null);

console.error(`API_BASE: ${API_BASE}`);

// Create server instance
const server = new Server({name: "waystation",version: "0.2.2"}, {capabilities: { tools: {} }});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Check if token file has been modified and refresh token if needed
    const freshToken = checkAndRefreshToken();
    WAY_KEY = process.env.WAY_KEY || freshToken || (process.argv.length > 2 ? process.argv[2] : null);
    
    // Fetch remote tools
    const response = await fetch(`${API_BASE}/tools/list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const remoteTools = await response.json();
    
    // Define local tools
    const localTools = {
        tools: [
            {
                name: "helloWayStation",
                description: "Call this action when users says 'Hello WayStation'. It displays welcome information about WayStation to the user",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                name: "openWayStation",
                description: "Call this action when users says 'Open WayStation'. Opens the WayStation desktop application",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        ]
    };
    
    // Combine remote and local tools
    return {
        tools: [...remoteTools.tools, ...localTools.tools]
    };
})

const WAYSTATION_HELLO = `
    When a user says "Hello WayStation", say the following:

    Oh nice, I see that you installed WayStation!

    WayStation is the marketplace that lets you use your favorite productivity apps without leaving this chat.

    For example, you can use the Monday integration to:
    - Check your boards and items
    - Create new items
    - Update existing items

    You can also use other apps like Asana, Notion, Slack, and more!

    Now type "Open WayStation" to get started.
"""
`;

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "helloWayStation") {
        return { error: false, content: [{ type: "text", text: WAYSTATION_HELLO }] };

    } else if (request.params.name === "openWayStation") {
        try {
            // Create config directory if it doesn't exist
            const configDir = getWayStationPath();
            fs.mkdirSync(configDir, { recursive: true });
            
            // Check and update onboarding state
            const onboardingFile = getWayStationPath('onboarding_completed');
            const onboardingCompleted = fs.existsSync(onboardingFile);
            
            if (!onboardingCompleted) {
                fs.writeFileSync(onboardingFile, 'true');
            }
            
            // Platform-specific code to open WayStation
            if (os.platform() === 'win32') {
                // Windows: Use start command to open WayStation
                try {
                    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
                    const wayStationPath = path.join(programFiles, 'WayStation', 'WayStation.exe');
                    execSync(`start "" "${wayStationPath}"`, { shell: 'cmd.exe' });
                } catch (innerError) {
                    throw new Error(`Failed to open WayStation on Windows: ${innerError instanceof Error ? innerError.message : String(innerError)}`);
                }
            } else if (os.platform() === 'darwin') {
                // macOS: Use AppleScript to activate WayStation
                const applescript = `tell application "WayStation" to activate
delay 0.5

tell application "System Events"
    -- Get the WayStation window
    set wayProcess to application process "WayStation"

    -- If WayStation has windows and is running, bring it to front
    if (exists wayProcess) and (count of windows of wayProcess) > 0 then
        set frontmost of wayProcess to true
    end if
end tell`;
                
                // Function to escape only double quotes in AppleScript
                function escapeAppleScriptString(str: string): string {
                    return str.replace(/"/g, '\\"');
                }
                
                execSync(`osascript -e "${escapeAppleScriptString(applescript)}"`);
            } else {
                throw new Error(`Unsupported platform: ${os.platform()}`);
            }
            
            return { 
                error: false, 
                content: [{ 
                    type: "text", 
                    text: "WayStation app has been opened successfully." 
                }] 
            };
        } catch (error) {
            return { 
                error: true, 
                content: [{ 
                    type: "text", 
                    text: `Error opening WayStation: ${error instanceof Error ? error.message : String(error)}` 
                }] 
            };
        }
    }
    
    // Check if token file has been modified and refresh token if needed
    const freshToken = checkAndRefreshToken();
    WAY_KEY = process.env.WAY_KEY || freshToken || (process.argv.length > 2 ? process.argv[2] : null);
    
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
