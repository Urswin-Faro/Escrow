import React, { useState } from 'react';
import api from '../services/api'; 

const CreateTransaction = () => {
    const [formData, setFormData] = useState({
        buyer_id: '',
        seller_id: '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const { buyer_id, seller_id, amount, description } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        
        try {
            const res = await api.post('/api/transactions/create', formData); // ✅ Fixed endpoint
            console.log(res.data);
            setStatus({ type: 'success', msg: 'Transaction created successfully!' });
            setFormData({ buyer_id: '', seller_id: '', amount: '', description: '' });
        } catch (err) {
            console.error('Transaction creation error:', err.response?.data);
            const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Transaction creation failed.';
            setStatus({ type: 'error', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create Transaction</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Buyer ID:</label>
                    <input 
                        type="number" 
                        name="buyer_id" 
                        value={buyer_id} 
                        onChange={onChange} 
                        required 
                        disabled={loading}
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label>Seller ID:</label>
                    <input 
                        type="number" 
                        name="seller_id" 
                        value={seller_id} 
                        onChange={onChange} 
                        required 
                        disabled={loading}
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label>Amount:</label>
                    <input 
                        type="number" 
                        name="amount" 
                        value={amount} 
                        onChange={onChange} 
                        required 
                        disabled={loading}
                        min="0.01"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                        name="description" 
                        value={description} 
                        onChange={onChange} 
                        required 
                        disabled={loading}
                        rows="4"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Transaction'}
                </button>
            </form>
            
            {status && (
                <p style={{ 
                    color: status.type === 'error' ? 'red' : 'green', 
                    marginTop: 12,
                    fontWeight: 'bold'
                }}>
                    {status.msg}
                </p>
            )}
        </div>
    );
};

export default CreateTransaction;