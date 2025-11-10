const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'employee@example.com', password: 'Password123!' })
});

const text = await response.text();
console.log(response.status, response.statusText, text);
