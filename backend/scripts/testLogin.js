const fetch = require('node-fetch');

async function testLogin() {
  try {
    const baseUrl = process.env.PORT ? `http://localhost:${process.env.PORT}/api` : 'http://localhost:3001/api';
    const resp = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'OperaAdmin', password: 'Oper42025$' })
    });
    const text = await resp.text();
    console.log('Status:', resp.status);
    console.log('Body:', text);
  } catch (e) {
    console.error('Error probando login:', e);
  }
}

testLogin();