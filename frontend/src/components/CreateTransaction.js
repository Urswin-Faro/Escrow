import React, { useState } from 'react';
import axios from 'axios';

const CreateTransaction = () => {
    const [formData, setFormData] = useState({
        buyer_id: '',
        seller_id: '',
        amount: '',
        description: ''
    });

    const { buyer_id, seller_id, amount, description } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/transactions/create', formData);
            console.log(res.data);
            alert('Transaction created successfully!');
            setFormData({ buyer_id: '', seller_id: '', amount: '', description: '' }); // Clear form
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Transaction creation failed.');
        }
    };

    return (
        <div className="form-container">
            <h2>Create Transaction</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Buyer ID:</label>
                    <input type="number" name="buyer_id" value={buyer_id} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Seller ID:</label>
                    <input type="number" name="seller_id" value={seller_id} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Amount:</label>
                    <input type="number" name="amount" value={amount} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea name="description" value={description} onChange={onChange} required />
                </div>
                <button type="submit">Create Transaction</button>
            </form>
        </div>
    );
};

export default CreateTransaction;