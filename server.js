// MCP Bridge Server for Amplify Campaign Manager
// This server bridges between your React app and the Amplify MCP server

const express = require('express');
const cors = require('cors');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MCP Client
let mcpClient = null;

async function initializeMCP() {
  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['@anthropic-ai/amplify-mcp-server']
    });
    
    mcpClient = new Client({
      name: "amplify-campaign-manager",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {}
      }
    });

    await mcpClient.connect(transport);
    console.log('✅ Connected to Amplify MCP Server');
  } catch (error) {
    console.error('❌ Failed to connect to MCP Server:', error);
  }
}

// MCP Bridge API endpoint
app.post('/api/mcp-bridge', async (req, res) => {
  try {
    const { function: functionName, params } = req.body;
    
    if (!mcpClient) {
      throw new Error('MCP Client not initialized');
    }

    let result;

    switch (functionName) {
      case 'amplify-mcp-server:get-my-amplify-marketers':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:get-my-amplify-marketers',
          arguments: {}
        });
        break;

      case 'amplify-mcp-server:get-amplify-campaigns':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:get-amplify-campaigns',
          arguments: { marketerId: params.marketerId }
        });
        break;

      case 'amplify-mcp-server:get-amplify-contents':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:get-amplify-contents',
          arguments: { campaignId: params.campaignId }
        });
        break;

      case 'amplify-mcp-server:get-amplify-campaigns-reporting':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:get-amplify-campaigns-reporting',
          arguments: {
            marketerId: params.marketerId,
            from: params.from,
            to: params.to,
            ...(params.campaignId && { campaignId: params.campaignId })
          }
        });
        break;

      case 'amplify-mcp-server:enable-amplify-campaign':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:enable-amplify-campaign',
          arguments: { campaignId: params.campaignId }
        });
        break;

      case 'amplify-mcp-server:disable-amplify-campaign':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:disable-amplify-campaign',
          arguments: { campaignId: params.campaignId }
        });
        break;

      case 'amplify-mcp-server:change-amplify-campaign-budget':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:change-amplify-campaign-budget',
          arguments: { 
            campaignId: params.campaignId, 
            budgetAmount: params.budgetAmount 
          }
        });
        break;

      case 'amplify-mcp-server:enable-amplify-content':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:enable-amplify-content',
          arguments: { contentId: params.contentId }
        });
        break;

      case 'amplify-mcp-server:disable-amplify-content':
        result = await mcpClient.callTool({
          name: 'amplify-mcp-server:disable-amplify-content',
          arguments: { contentId: params.contentId }
        });
        break;

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }

    // Parse the result if it's a string
    let responseData = result;
    if (typeof result === 'string') {
      try {
        responseData = JSON.parse(result);
      } catch (e) {
        responseData = result;
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error('MCP Bridge Error:', error);
    res.status(500).json({ 
      error: 'MCP Bridge Error', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mcpConnected: !!mcpClient,
    timestamp: new Date().toISOString()
  });
});

// Serve static files (your React app)
app.use(express.static('build'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Bridge Server running on port ${PORT}`);
  initializeMCP();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});