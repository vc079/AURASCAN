const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, () => {
    console.log(`InspiroLog running on http://localhost:${env.PORT}`);
    console.log(`- QR Generator: http://localhost:${env.PORT}/generate`);
    console.log(`- Inspiration Endpoint: http://localhost:${env.PORT}/inspire`);
});