import axios from 'axios';

// Test our API connectivity
async function testApi() {
  try {
    console.log('Testing API connectivity...');
    
    // Test direct server connection
    const serverResponse = await axios.get('http://localhost:3001/api/test');
    console.log('Direct server response:', serverResponse.data);
    
    // Test API via proxy
    const proxyResponse = await axios.get('/api/test');
    console.log('Proxy response:', proxyResponse.data);
    
    // Test game endpoints
    const activityResponse = await axios.get('/api/game/activity');
    console.log('Activity response:', activityResponse.data);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testApi();

export {};
