function isPrivateOrLocal(ip) {
    if (!ip) return true;
    const cleanIp = ip.replace(/^::ffff:/, '');
    if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') return true;
    
    // Check standard private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    const parts = cleanIp.split('.').map(Number);
    if (parts.length === 4) {
        if (parts[0] === 10) return true;
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        if (parts[0] === 192 && parts[1] === 168) return true;
    }
    return false;
}

function normalizeIp(rawIp) {
    if (!rawIp) return '127.0.0.1';
    return rawIp.replace(/^::ffff:/, '');
}

module.exports = { isPrivateOrLocal, normalizeIp };