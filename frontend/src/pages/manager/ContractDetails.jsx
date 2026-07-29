import { useState } from 'react';
import { FileText, Eye, Pencil, User, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import api from '../../api/axios';
import { downloadPdf } from '../../utils/downloadPdf';
import { validateContractForm } from '../../utils/validation';

export default function ContractDetails({ contract, onClose, onUpdated }) {
  const [mode, setMode] = useState('view'); // view | edit
  const [form, setForm] = useState({
    start_date: contract.start_date?.slice(0, 10) || '',
    end_date: contract.end_date?.slice(0, 10) || '',
    total_amount: contract.total_amount,
    witness: contract.witnesses?.[0] || { full_name: '', nida_number: '', phone: '', address: '' },
    guarantor: contract.guarantors?.[0] || { full_name: '', phone: '', address: '', nida_number: '' },
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const canEdit = !['completed', 'terminated'].includes(contract.status);

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateContractForm({ witness: form.witness, guarantor: form.guarantor });
    if (!form.start_date) errs.start_date = 'Start date is required';
    if (!form.total_amount || Number(form.total_amount) <= 0) errs.total_amount = 'Enter a valid total amount';
    if (Number(form.total_amount) < Number(contract.paid_amount)) {
      errs.total_amount = `Cannot be less than amount already paid (TZS ${Number(contract.paid_amount).toLocaleString()})`;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const res = await api.put(`/contracts/${contract.id}`, {
        start_date: form.start_date,
        end_date: form.end_date || null,
        total_amount: Number(form.total_amount),
        witness: form.witness,
        guarantor: form.guarantor,
      });
      setMessage('Contract updated successfully');
      onUpdated?.(res.data);
      setMode('view');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to update contract' });
    } finally {
      setSaving(false);
    }
  };

  // Determine acceptance status for display
  const getAcceptanceStatus = () => {
    if (contract.accepted_at) {
      return {
        label: `Amekubali - ${new Date(contract.accepted_at).toLocaleDateString()}`,
        icon: CheckCircle2,
        color: 'var(--success)',
        bg: '#DCFCE7',
      };
    }
    if (contract.rejected_at) {
      return {
        label: `Amekataa${contract.rejection_reason ? `: ${contract.rejection_reason}` : ''}`,
        icon: XCircle,
        color: 'var(--danger)',
        bg: '#FEE2E2',
      };
    }
    return {
      label: 'Bado hajakubali masharti',
      icon: Clock,
      color: '#92400E',
      bg: '#FEF3C7',
    };
  };

  const acceptance = getAcceptanceStatus();
  const AcceptanceIcon = acceptance.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box contract-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs-header">
          <h2>Contract #{contract.id}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && mode === 'view' && (
              <button className="btn-small btn-edit" onClick={() => setMode('edit')}>
                <Pencil size={13} style={{ marginRight: 4 }} /> Edit
              </button>
            )}
            {mode === 'edit' && (
              <button className="btn-small" onClick={() => setMode('view')}>
                <Eye size={13} style={{ marginRight: 4 }} /> View
              </button>
            )}
            <button
              className="btn-small btn-approve"
              onClick={() => downloadPdf(`/contracts/${contract.id}/pdf`, `contract-${contract.id}.pdf`)}
            >
              <Download size={13} style={{ marginRight: 4 }} /> PDF
            </button>
          </div>
        </div>

        {message && <div className="alert-success">{message}</div>}
        {errors.general && <div className="alert-error">{errors.general}</div>}

        {/* ISSUED BY BLOCK — always visible */}
        <div className="issued-by-box">
          <User size={16} />
          <div>
            <span className="detail-label">Issued By (Manager)</span>
            <span className="detail-value">{contract.issuedBy?.full_name || contract.issued_by?.full_name || 'N/A'}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span className="detail-label">Issued On</span>
            <span className="detail-value">{new Date(contract.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* ACCEPTANCE STATUS BLOCK */}
        <div className="issued-by-box" style={{ background: acceptance.bg, borderColor: 'transparent', marginTop: 10 }}>
          <AcceptanceIcon size={16} style={{ color: acceptance.color }} />
          <div>
            <span className="detail-label">Hali ya Ukubali</span>
            <span className="detail-value" style={{ color: acceptance.color }}>{acceptance.label}</span>
          </div>
        </div>

        {mode === 'view' ? (
          <div className="contract-view-body">
            <div className="contract-amounts" style={{ marginBottom: 16, marginTop: 16 }}>
              <div>
                <span className="amount-label">Total</span>
                <span className="amount-value">TZS {Number(contract.total_amount).toLocaleString()}</span>
              </div>
              <div>
                <span className="amount-label">Paid</span>
                <span className="amount-value" style={{ color: 'var(--success)' }}>TZS {Number(contract.paid_amount).toLocaleString()}</span>
              </div>
              <div>
                <span className="amount-label">Balance</span>
                <span className="amount-value balance-highlight">TZS {Number(contract.balance).toLocaleString()}</span>
              </div>
            </div>

            <div className="detail-grid">
              <div><span className="detail-label">Start Date</span><span className="detail-value">{contract.start_date}</span></div>
              <div><span className="detail-label">End Date</span><span className="detail-value">{contract.end_date || 'N/A'}</span></div>
              <div><span className="detail-label">Customer</span><span className="detail-value">{contract.user?.full_name}</span></div>
              <div><span className="detail-label">Motorcycle</span><span className="detail-value">{contract.motorcycle?.brand} {contract.motorcycle?.model}</span></div>
            </div>

            <h3 style={{ marginTop: 18, marginBottom: 8, fontSize: 14, color: 'var(--primary)' }}>Witness</h3>
            <div className="detail-grid">
              <div><span className="detail-label">Name</span><span className="detail-value">{contract.witnesses?.[0]?.full_name}</span></div>
              <div><span className="detail-label">NIDA</span><span className="detail-value">{contract.witnesses?.[0]?.nida_number}</span></div>
              <div><span className="detail-label">Phone</span><span className="detail-value">{contract.witnesses?.[0]?.phone}</span></div>
              <div><span className="detail-label">Address</span><span className="detail-value">{contract.witnesses?.[0]?.address}</span></div>
            </div>

            <h3 style={{ marginTop: 18, marginBottom: 8, fontSize: 14, color: 'var(--primary)' }}>Guarantor</h3>
            <div className="detail-grid">
              <div><span className="detail-label">Name</span><span className="detail-value">{contract.guarantors?.[0]?.full_name}</span></div>
              <div><span className="detail-label">NIDA</span><span className="detail-value">{contract.guarantors?.[0]?.nida_number}</span></div>
              <div><span className="detail-label">Phone</span><span className="detail-value">{contract.guarantors?.[0]?.phone}</span></div>
              <div><span className="detail-label">Address</span><span className="detail-value">{contract.guarantors?.[0]?.address}</span></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="contract-form" style={{ padding: 0, boxShadow: 'none', border: 'none', marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            {errors.start_date && <span className="field-error">{errors.start_date}</span>}

            <label style={{ fontSize: 12, fontWeight: 600, marginTop: 8, display: 'block' }}>Total Contract Amount (TZS)</label>
            <input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
            {errors.total_amount && <span className="field-error">{errors.total_amount}</span>}

            <h3>Witness Details</h3>
            <input placeholder="Full Name" value={form.witness.full_name}
              onChange={(e) => setForm({ ...form, witness: { ...form.witness, full_name: e.target.value } })} />
            {errors.witness_name && <span className="field-error">{errors.witness_name}</span>}

            <input placeholder="NIDA Number" value={form.witness.nida_number}
              onChange={(e) => setForm({ ...form, witness: { ...form.witness, nida_number: e.target.value } })} />
            {errors.witness_nida && <span className="field-error">{errors.witness_nida}</span>}

            <input placeholder="Phone Number" value={form.witness.phone}
              onChange={(e) => setForm({ ...form, witness: { ...form.witness, phone: e.target.value } })} />
            {errors.witness_phone && <span className="field-error">{errors.witness_phone}</span>}

            <input placeholder="Address" value={form.witness.address}
              onChange={(e) => setForm({ ...form, witness: { ...form.witness, address: e.target.value } })} />

            <h3>Guarantor Details</h3>
            <input placeholder="Full Name" value={form.guarantor.full_name}
              onChange={(e) => setForm({ ...form, guarantor: { ...form.guarantor, full_name: e.target.value } })} />
            {errors.guarantor_name && <span className="field-error">{errors.guarantor_name}</span>}

            <input placeholder="Phone Number" value={form.guarantor.phone}
              onChange={(e) => setForm({ ...form, guarantor: { ...form.guarantor, phone: e.target.value } })} />
            {errors.guarantor_phone && <span className="field-error">{errors.guarantor_phone}</span>}

            <input placeholder="Address" value={form.guarantor.address}
              onChange={(e) => setForm({ ...form, guarantor: { ...form.guarantor, address: e.target.value } })} />

            <input placeholder="NIDA Number" value={form.guarantor.nida_number}
              onChange={(e) => setForm({ ...form, guarantor: { ...form.guarantor, nida_number: e.target.value } })} />
            {errors.guarantor_nida && <span className="field-error">{errors.guarantor_nida}</span>}

            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 14 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}