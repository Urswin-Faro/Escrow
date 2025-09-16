const pool = require('../db');

exports.createTransaction = async (req, res) => {
    // You will need to get the user ID from the JWT token later
    const { buyer_id, seller_id, amount, description } = req.body;

    try {
        const query = 'INSERT INTO transactions (buyer_id, seller_id, amount, description) VALUES (?, ?, ?, ?)';
        const values = [buyer_id, seller_id, amount, description];
        const [result] = await pool.query(query, values);

        res.status(201).json({ 
            msg: 'Transaction created successfully', 
            transactionId: result.insertId 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};