import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function login(phone, password) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { phone, password });
    return res.data.data.accessToken;
  } catch(e) {
    throw e;
  }
}

async function runTests() {
  try {
    const officerToken = await login('250780000004', 'password123'); // officer2
    
    // Create advisory
    console.log("Sending advisory...");
    const createRes = await axios.post(`${API_URL}/officer/advisories`, {
      title: "Test Advisory from script",
      message: "Please irrigate your crops",
      severity: "info",
      farmerIds: []
    }, { headers: { Authorization: `Bearer ${officerToken}` } });
    
    console.log("Create response:", createRes.status, createRes.data);

    // Get Advisories
    const advRes = await axios.get(`${API_URL}/officer/advisories`, { headers: { Authorization: `Bearer ${officerToken}` } });
    console.log("Advisories data:", JSON.stringify(advRes.data, null, 2));

  } catch (error) {
    console.error('Fatal Test Error:', error.message);
    if(error.response) console.error(error.response.data);
  }
}

runTests();
