# What is WayStation
WayStation connects any MCP host with the productivity tools you use daily through our no-code, secure integration hub. 

# WayStation MCP Server
The WayStation [MCP server](https://waystation.ai/connect/mcp-server) connect any MCP host with the productivity tools people use daily via secure, no-code integration hub.

## Getting your WAY_KEY
To get your WAY_KEY you need to sign up at [our web site](https://waystation.ai) first, connect your apps and then get your key via [dashboard](https://waystation.ai/connect/mcp-server/guide).

## Running the WayStation MCP server using npx
To run the WayStation MCP server using npx, use the following command:

```bash
npx -y @waystation/mcp <your_WAY_KEY>
```

## Connecting to Claude Desktop
To connect Claude Desktop to the productivity tools set up in WayStation please add the following snippet to `~/Library/Application Support/Claude/claude_desktop_config.json`. You can find more detailed instructions at [Quickstart For Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user).

```json
{
    "mcpServers": {
      "filesystem": {
        ...
      },
      "waystation": {
        "command": "npx",
        "args": ["-y", "@waystation/mcp", "<your_WAY_KEY>"],
      }
    }
  }
```
