const qrcode = require('qrcode');
const { validateTargetUrl } = require('../utils/url.utils');

async function generateQrDataUrl(rawUrl) {
    const validUrl = validateTargetUrl(rawUrl);
    return await qrcode.toDataURL(validUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320
    });
}

module.exports = { generateQrDataUrl };