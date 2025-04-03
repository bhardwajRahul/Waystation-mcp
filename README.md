# What is WayStation
[WayStation](https://waystation.ai) connects Claude Desktop, ChatGPT and any MCP host with the productivity tools people use daily through a no-code, secure integration hub. 

## WayStation MCP Server
The WayStation [MCP server](https://waystation.ai/connect/mcp-server) enables seamless and secure connectivity for any MCP host like Cline or Cursor.

## Getting your WAY_KEY
You will need your WAY_KEY to connect to WayStation. To get your WAY_KEY you need to sign up at [our web site](https://waystation.ai) first, connect your apps and then get your key via [dashboard](https://waystation.ai/connect/mcp-server/guide).

## Running the WayStation MCP server using npx
To run the WayStation MCP server using npx, use the following command:

```bash
npx -y @waystation/mcp <your_WAY_KEY>
```

## Connecting to Claude Desktop
We highly recommend using [Marketplace for Claude](https://waystation.ai/marketplace/claude) to connect Claude Desktop to WayStation. 

 <video controls autoPlay muted loop playsInline poster="https://waystation.ai/images/hero.png">
      <source src="https://waystation.ai/videos/marketplace169vo.mp4" type="video/mp4" />
      <source src="https://waystation.ai/videos/marketplace169vo.webm" type="video/webm" />
      {/* Fallback to image if video fails to load */}
      <Image src="https://waystation.ai/images/hero.png" alt="Marketplace for Claude" width={1168} height={716} />
  </video>


Alternatively, you can use canonical way by adding the following snippet to `~/Library/Application Support/Claude/claude_desktop_config.json`. You can find more detailed instructions at [Quickstart For Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user).

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
