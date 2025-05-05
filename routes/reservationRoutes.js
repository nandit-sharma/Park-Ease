import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { userId, parkingLotId, vehicleNumber, startTime, endTime } = req.body;
        
        const parkingLotResult = await db.query('SELECT * FROM parking_lots WHERE id = $1', [parkingLotId]);
        if (parkingLotResult.rows.length === 0 || parkingLotResult.rows[0].available_slots <= 0) {
            return res.status(400).json({ message: 'No available slots in this parking lot' });
        }

        const result = await db.query(
            'INSERT INTO reservations (user_id, parking_lot_id, vehicle_number, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, parkingLotId, vehicleNumber, startTime, endTime, 'pending']
        );

        await db.query(
            'UPDATE parking_lots SET available_slots = available_slots - 1 WHERE id = $1',
            [parkingLotId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { status, userId } = req.query;
        let query = 'SELECT r.*, u.name as user_name, u.email as user_email, p.name as parking_lot_name FROM reservations r JOIN users u ON r.user_id = u.id JOIN parking_lots p ON r.parking_lot_id = p.id';
        const params = [];
        let paramCount = 1;

        if (status || userId) {
            query += ' WHERE';
            if (status) {
                query += ` r.status = $${paramCount}`;
                params.push(status);
                paramCount++;
            }
            if (userId) {
                if (status) query += ' AND';
                query += ` r.user_id = $${paramCount}`;
                params.push(userId);
            }
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const result = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = result.rows[0];
        if (status === 'cancelled' && reservation.status !== 'cancelled') {
            await db.query(
                'UPDATE parking_lots SET available_slots = available_slots + 1 WHERE id = $1',
                [reservation.parking_lot_id]
            );
        }

        const updateResult = await db.query(
            'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        res.json(updateResult.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = result.rows[0];
        await db.query(
            'UPDATE parking_lots SET available_slots = available_slots + 1 WHERE id = $1',
            [reservation.parking_lot_id]
        );

        await db.query('DELETE FROM reservations WHERE id = $1', [req.params.id]);
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default reservationRoutes; 