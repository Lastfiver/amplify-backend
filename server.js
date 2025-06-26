const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://*.vercel.app',
    'https://*.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// MCP Bridge API endpoint
app.post('/api/mcp-bridge', async (req, res) => {
  try {
    const { function: functionName, params } = req.body;
    
    console.log(`📞 API Call: ${functionName}`);
    
    // Demo data responses (we'll connect real MCP later)
    let result;

    switch (functionName) {
      case 'amplify-mcp-server:get-my-amplify-marketers':
        result = [
          {
            id: "00037dfc4e76d2a5dbdd7ee00f0fd871e3",
            name: "Route Agency Limited",
            enabled: true,
            currency: "GBP"
          }
        ];
        break;

      case 'amplify-mcp-server:get-amplify-campaigns':
        result = [
          {
            id: "009be0ce07f9b8c6079cc0a6db14a990f9",
            name: "Carents Room Volume Mobile Traffic Campaign January 2025",
            enabled: false,
            currency: "GBP",
            budget: { amount: 1000 },
            cpc: 0.0131,
            targeting: { platform: ["MOBILE", "TABLET"] },
            liveStatus: { amountSpent: 0, campaignOnAir: false }
          },
          {
            id: "00e2e008dd9c2fffa3ef21ff551dacbc08",
            name: "Carents Room Traffic Campaign - June 2025",
            enabled: true,
            currency: "GBP",
            budget: { amount: 1550 },
            cpc: 0.0112,
            targeting: { platform: ["MOBILE", "TABLET"] },
            liveStatus: { amountSpent: 1295.32, campaignOnAir: true }
          }
        ];
        break;

      case 'amplify-mcp-server:get-amplify-contents':
        result = [
          {
            id: `content-${params.campaignId}-1`,
            headline: 'Carents Room - Premium Content Discovery',
            enabled: true,
            campaignId: params.campaignId
          },
          {
            id: `content-${params.campaignId}-2`,
            headline: 'Discover Family-Friendly Spaces',
            enabled: true,
            campaignId: params.campaignId
          }
        ];
        break;

      case 'amplify-mcp-server:get-amplify-campaigns-reporting':
        result = {
          totalSpend: 1295.32,
          impressions: 2840000,
          clicks: 115640,
          conversions: 1847,
          ctr: 4.07,
          cpc: 0.0112,
          cpa: 0.70,
          conversionRate: 1.60
        };
        break;

      case 'amplify-mcp-server:enable-amplify-campaign':
      case 'amplify-mcp-server:disable-amplify-campaign':
      case 'amplify-mcp-server:change-amplify-campaign-budget':
      case 'amplify-mcp-server:enable-amplify-content':
      case 'amplify-mcp-server:disable-amplify-content':
        result = { 
          success: true, 
          message: `${functionName} executed successfully`,
          timestamp: new Date().toISOString()
        };
        break;

      default:
        result = { 
          error: `Unknown function: ${functionName}`,
          availableFunctions: [
            'get-my-amplify-marketers',
            'get-amplify-campaigns', 
            'get-amplify-contents',
            'get-amplify-campaigns-reporting'
          ]
        };
    }

    console.log(`✅ Response sent for: ${functionName}`);
    res.json(result);

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: 'demo',
    mcpConnected: false,
    server: 'Railway',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Amplify Campaign Manager API',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/mcp-bridge'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Amplify MCP Bridge Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Mode: Demo (Real MCP integration coming soon)`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server gracefully...');
  process.exit(0);
});