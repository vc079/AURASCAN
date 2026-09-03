module.exports = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    console.error(`[Error] Request ID ${req.requestId}:`, err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        requestId: req.requestId
    });
};
