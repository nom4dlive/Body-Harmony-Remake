import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { api } from '../../../services/api';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Item = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 15px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Form = styled.div`
  background: #111;
  padding: 20px;
  border: 1px solid #222;
  border-radius: 8px;
  margin-bottom: 30px;
  display: grid;
  gap: 15px;

  input, textarea, select {
    background: #222;
    border: 1px solid #333;
    color: #fff;
    padding: 10px;
    border-radius: 4px;
    width: 100%;
    font-family: inherit;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#00bcd4' : '#333'};
  color: ${props => props.$primary ? '#000' : '#fff'};
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
`;

const FaqEditor = () => {
    const [faqs, setFaqs] = useState([]);
    const [editing, setEditing] = useState(null); // ID or null (for new)
    const [form, setForm] = useState({ question: '', answer: '', category: 'general', display_order: 0 });

    const load = async () => {
        try {
            const res = await api.nexus.getFaqs();
            if (res && res.faqs) setFaqs(res.faqs);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        const action = editing === 'new' ? 'create' : 'update';
        const payload = { ...form, action, id: editing === 'new' ? undefined : editing };

        await api.nexus.manageFaq(payload);
        setEditing(null);
        setForm({ question: '', answer: '', category: 'general', display_order: 0 });
        load();
    };

    const handleEdit = (item) => {
        setEditing(item.id);
        setForm(item);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this FAQ?')) return;
        await api.nexus.manageFaq({ action: 'delete', id });
        load();
    };

    return (
        <div>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>FAQ Manager</h2>

            {editing && (
                <Form>
                    <h3 style={{ margin: 0, color: '#888' }}>{editing === 'new' ? 'New FAQ' : 'Edit FAQ'}</h3>
                    <input
                        placeholder="Question"
                        value={form.question}
                        onChange={e => setForm({ ...form, question: e.target.value })}
                    />
                    <textarea
                        placeholder="Answer (HTML allowed)"
                        rows={4}
                        value={form.answer}
                        onChange={e => setForm({ ...form, answer: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            placeholder="Order"
                            style={{ width: '100px' }}
                            value={form.display_order}
                            onChange={e => setForm({ ...form, display_order: e.target.value })}
                        />
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            <option value="general">General</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical</option>
                            <option value="content">Content</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button $primary onClick={handleSubmit}><Save size={16} /> Save</Button>
                        <Button onClick={() => setEditing(null)}><X size={16} /> Cancel</Button>
                    </div>
                </Form>
            )}

            {!editing && (
                <Button $primary onClick={() => { setEditing('new'); setForm({ question: '', answer: '', category: 'general', display_order: 0 }); }} style={{ marginBottom: '20px' }}>
                    <Plus size={16} /> Add FAQ
                </Button>
            )}

            <List>
                {faqs.map(f => (
                    <Item key={f.id}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#00bcd4', marginBottom: '5px', fontWeight: 'bold' }}>{f.question}</div>
                            <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{f.answer.substring(0, 100)}...</div>
                            <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px' }}>
                                #{f.display_order} • {f.category}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button onClick={() => handleEdit(f)}><Edit2 size={14} /></Button>
                            <Button onClick={() => handleDelete(f.id)} style={{ color: '#f44336', background: '#3a1b1b' }}><Trash2 size={14} /></Button>
                        </div>
                    </Item>
                ))}
            </List>
        </div>
    );
};

export default FaqEditor;
