import jwt from 'jsonwebtoken';
import pool from '../db.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No authentication token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin only.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export { auth, adminAuth }; 