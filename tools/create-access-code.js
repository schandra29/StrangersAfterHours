/**
 * This script creates an access code for the application
 * Usage: node tools/create-access-code.js MYCODE "My description" 5
 * Where:
 *   MYCODE = The access code to create
 *   "My description" = Optional description of the code
 *   5 = Optional max usage count (default is 5 if not specified)
 * 
 * Examples:
 *   node tools/create-access-code.js TESTER1 "For tester group 1"
 *   node tools/create-access-code.js BETAUSER "Beta test participant" 3
 */

import fetch from 'node-fetch';

async function createAccessCode() {
  const [,, code, description = "", maxUsages = 5] = process.argv;
  
  if (!code) {
    console.error('Usage: node create-access-code.js CODE [DESCRIPTION] [MAX_USAGES]');
    process.exit(1);
  }
  
  const adminKey = process.env.ADMIN_KEY || 'strangers_admin';
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/access-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
      },
      body: JSON.stringify({
        code,
        description: description || null,
        isActive: true,
        maxUsages: parseInt(maxUsages, 10),
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create access code: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Access code created successfully:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error creating access code:', error.message);
    process.exit(1);
  }
}

// Execute the function
createAccessCode();