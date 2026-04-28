const http = require('http');

const data = JSON.stringify({ email: 'admin@admin.com', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log('Login Response:', parsed);
      
      if (!parsed.token) {
        console.error('No token received');
        return;
      }
      
      const token = parsed.token;
      
      // Now get users
      const usersOpt = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/users',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      };
      
      const resReq = http.request(usersOpt, (res2) => {
        let uBody = '';
        res2.on('data', c => uBody += c);
        res2.on('end', () => {
          const users = JSON.parse(uBody);
          console.log('Found users:', users.length);
          const target = (users[1] || users[0])._id;
          
          // Send notif
          const msgData = JSON.stringify({ recipient: target, title: 'Test', message: 'Hello' });
          const msgOpt = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/notifications/send',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(msgData),
              'Authorization': 'Bearer ' + token
            }
          };
          
          const msgReq = http.request(msgOpt, (res3) => {
            let mBody = '';
            res3.on('data', c => mBody += c);
            res3.on('end', () => console.log('Send Notif Status:', res3.statusCode, mBody));
          });
          msgReq.on('error', e => console.error('Send Error:', e.message));
          msgReq.write(msgData);
          msgReq.end();
        });
      });
      resReq.on('error', e => console.error('Uses Error:', e.message));
      resReq.end();
      
    } catch (e) {
      console.error('Error parsing response:', body, e);
    }
  });
});
req.on('error', (e) => console.error('Request error:', e.message));
req.write(data);
req.end();
