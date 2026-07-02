import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tradeAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const initialForm = {
  buyer: '', seller: '', assetType: 'Stock', assetSymbol: '', assetName: '',
  price: '', quantity: '', currency: 'USD', tradeDate: '', settlementDate: '',
  broker: '', counterparty: '', riskLevel: 'Low', notes: '', source: 'Manual'
};

const brokers = ['Bloomberg Terminal', 'Reuters Eikon', 'ICE', 'CME Group', 'NYSE', 'NASDAQ', 'LSE', 'Euronext'];
const counterparties = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Barclays', 'Deutsche Bank', 'UBS', 'Citigroup', 'HSBC', 'BNP Paribas'];

export default function TradeForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.buyer) errs.buyer = 'Required';
    if (!form.seller) errs.seller = 'Required';
    if (!form.assetSymbol) errs.assetSymbol = 'Required';
    if (!form.assetName) errs.assetName = 'Required';
    if (!form.price || form.price <= 0) errs.price = 'Must be positive';
    if (!form.quantity || form.quantity <= 0) errs.quantity = 'Must be positive';
    if (!form.tradeDate) errs.tradeDate = 'Required';
    if (!form.settlementDate) errs.settlementDate = 'Required';
    if (!form.broker) errs.broker = 'Required';
    if (!form.counterparty) errs.counterparty = 'Required';
    if (form.tradeDate && new Date(form.tradeDate) > new Date()) errs.tradeDate = 'Cannot be in the future';
    if (form.settlementDate && form.tradeDate && new Date(form.settlementDate) <= new Date(form.tradeDate)) errs.settlementDate = 'Must be after trade date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix validation errors');
    setLoading(true);
    try {
      const res = await tradeAPI.create({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
      toast.success(`Trade ${res.data.data.tradeId} created successfully!`);
      navigate(`/trades/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trade');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const Field = ({ label, name, type = 'text', children, required }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      {children || <input type={type} className="form-control" value={form[name]} onChange={e => set(name, e.target.value)} />}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-4">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trades')}><FiArrowLeft size={13} /> Back</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>New Trade Entry</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trade ID will be auto-generated on submission</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">🏦 Counterparty Information</span></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Buyer" name="buyer" required>
                <select className="form-control" value={form.buyer} onChange={e => set('buyer', e.target.value)}>
                  <option value="">Select Buyer</option>
                  {counterparties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Seller" name="seller" required>
                <select className="form-control" value={form.seller} onChange={e => set('seller', e.target.value)}>
                  <option value="">Select Seller</option>
                  {counterparties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Counterparty" name="counterparty" required>
                <select className="form-control" value={form.counterparty} onChange={e => set('counterparty', e.target.value)}>
                  <option value="">Select Counterparty</option>
                  {counterparties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Broker" name="broker" required>
                <select className="form-control" value={form.broker} onChange={e => set('broker', e.target.value)}>
                  <option value="">Select Broker</option>
                  {brokers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header"><span className="card-title">📦 Asset Details</span></div>
          <div className="card-body">
            <div className="form-grid-3">
              <Field label="Asset Type" name="assetType" required>
                <select className="form-control" value={form.assetType} onChange={e => set('assetType', e.target.value)}>
                  {['Stock', 'Bond', 'ETF', 'Currency'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Asset Symbol" name="assetSymbol" required>
                <input className="form-control" placeholder="e.g. AAPL" value={form.assetSymbol} onChange={e => set('assetSymbol', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Asset Name" name="assetName" required>
                <input className="form-control" placeholder="e.g. Apple Inc." value={form.assetName} onChange={e => set('assetName', e.target.value)} />
              </Field>
            </div>
            <div className="form-grid-3">
              <Field label="Price" name="price" required>
                <input type="number" step="0.01" min="0.01" className="form-control" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
              </Field>
              <Field label="Quantity" name="quantity" required>
                <input type="number" min="1" className="form-control" placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
              </Field>
              <Field label="Currency" name="currency" required>
                <select className="form-control" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            {form.price && form.quantity && (
              <div style={{ padding: '10px 14px', background: 'rgba(14,165,233,0.08)', borderRadius: 8, border: '1px solid rgba(14,165,233,0.2)', fontSize: 13 }}>
                💰 Total Value: <strong>${(Number(form.price) * Number(form.quantity)).toLocaleString()} {form.currency}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header"><span className="card-title">📅 Trade Dates & Risk</span></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Trade Date" name="tradeDate" type="date" required />
              <Field label="Settlement Date" name="settlementDate" type="date" required />
              <Field label="Risk Level" name="riskLevel" required>
                <select className="form-control" value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}>
                  {['Low', 'Medium', 'High', 'Critical'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Source" name="source">
                <select className="form-control" value={form.source} onChange={e => set('source', e.target.value)}>
                  {['Manual', 'API', 'Import'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3} placeholder="Additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-between">
          <button type="button" className="btn btn-secondary" onClick={() => setForm(initialForm)}>Reset Form</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <FiSave size={14} /> {loading ? 'Creating Trade...' : 'Create Trade'}
          </button>
        </div>
      </form>
    </div>
  );
}
