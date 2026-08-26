const qrService = require('../services/qr.service');

async function renderQr(req, res) {
    try {
        const urlToEncode = req.query.url || `${req.protocol}://${req.get('host')}/inspire`;
        const qrCodeUrl = await qrService.generateQrDataUrl(urlToEncode);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>InspiroLog - QR Generator</title>
                <style>
                    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
                    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
                    img { margin-top: 1rem; border-radius: 8px; }
                    p { color: #64748b; font-size: 0.9rem; word-break: break-all; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>InspiroLog QR</h2>
                    <p>Scan to receive an inspirational quote:</p>
                    <img src="${qrCodeUrl}" alt="QR Code" />
                    <p><small>${urlToEncode}</small></p>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(400).send(`<h3>Invalid Request: ${err.message}</h3>`);
    }
}

module.exports = { renderQr };