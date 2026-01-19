async function testAIInsights() {
  try {
    console.log('Testing enhanced AI insights generation...');

    const response = await fetch('http://localhost:5000/api/analyze/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        query: "Provide key insights and recommendations for supply chain optimization"
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ API call successful!');
      console.log('📊 Response preview:');
      console.log(data.data.response.substring(0, 500) + '...');

      if (data.data.salesSuggestions) {
        console.log(`💰 Found ${data.data.salesSuggestions.length} sales suggestions`);
      }

      if (data.data.inventoryMetrics) {
        console.log('📦 Inventory metrics:', Object.keys(data.data.inventoryMetrics));
      }
    } else {
      console.log('❌ API call failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIInsights();