async function main() {
  const loginRes = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "250780000004", password: "password123" }),
  });
  const login = await loginRes.json();
  const token = login.data.accessToken;

  const farmersRes = await fetch("http://localhost:3000/api/v1/farmers", {
    headers: { Authorization: "Bearer " + token },
  });
  const farmers = await farmersRes.json();

  console.log("GET /farmers keys:", Object.keys(farmers));
  console.log("GET /farmers data type:", typeof farmers.data);
  console.log("GET /farmers data is array:", Array.isArray(farmers.data));
  console.log(
    "GET /farmers data length:",
    Array.isArray(farmers.data) ? farmers.data.length : "N/A",
  );
}
main().catch((e) => console.error(e.message));
