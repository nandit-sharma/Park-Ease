const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const { name, totalSlots } = req.body;
        const result = await db.query(
            'INSERT INTO parking_lots (name, total_slots, available_slots, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, totalSlots, totalSlots, 'active']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM parking_lots');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM parking_lots WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, totalSlots, status } = req.body;
        const result = await db.query('SELECT * FROM parking_lots WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }

        const parkingLot = result.rows[0];
        const newTotalSlots = totalSlots || parkingLot.total_slots;
        const difference = newTotalSlots - parkingLot.total_slots;
        const newAvailableSlots = parkingLot.available_slots + difference;

        const updateResult = await db.query(
            'UPDATE parking_lots SET name = $1, total_slots = $2, available_slots = $3, status = $4 WHERE id = $5 RETURNING *',
            [name || parkingLot.name, newTotalSlots, newAvailableSlots, status || parkingLot.status, req.params.id]
        );

        res.json(updateResult.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM parking_lots WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }
        res.json({ message: 'Parking lot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 