const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.code === '23505') {
        return res.status(409).json({ message: 'Duplicate entry' });
    }
    
    if (err.code === '23503') {
        return res.status(404).json({ message: 'Referenced record not found' });
    }
    
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export default errorHandler; 