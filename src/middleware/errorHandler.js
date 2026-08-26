module.exports = (err, req, res, next) => {
    console.error(`[Error] Request ID ${req.requestId}:`, err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        requestId: req.requestId
    });
};