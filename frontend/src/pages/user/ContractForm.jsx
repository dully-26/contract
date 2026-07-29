import { useState } from 'react';
import api from '../../api/axios';
import { validateContractForm } from '../../utils/validation';

export default function ContractForm({ contractRequestId, motorcyclePrice, onSuccess }) {
  const [witness, setWitness] = useState({ full_name: '', nida_number: '', phone: '', address: '' });
  const [guarantor, setGuarantor] = useState({ full_name: '', phone: '', address: '', nida_number: '' });
  const [startDate, setStartDate] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateContractForm({ witness, guarantor });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await api.post('/contracts', {
        contract_request_id: contractRequestId,
        start_date: startDate,
        total_amount: motorcyclePrice,
        witness,
        guarantor,
      });
      onSuccess?.();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to create contract' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="contract-form" onSubmit={handleSubmit}>
      <h3>Witness Details</h3>
      <input placeholder="Full Name" value={witness.full_name}
        onChange={(e) => setWitness({ ...witness, full_name: e.target.value })} />
      {errors.witness_name && <span className="field-error">{errors.witness_name}</span>}

      <input placeholder="NIDA Number" value={witness.nida_number}
        onChange={(e) => setWitness({ ...witness, nida_number: e.target.value })} />
      {errors.witness_nida && <span className="field-error">{errors.witness_nida}</span>}

      <input placeholder="Phone Number" value={witness.phone}
        onChange={(e) => setWitness({ ...witness, phone: e.target.value })} />
      {errors.witness_phone && <span className="field-error">{errors.witness_phone}</span>}

      <input placeholder="Address" value={witness.address}
        onChange={(e) => setWitness({ ...witness, address: e.target.value })} />

      <h3>Guarantor Details</h3>
      <input placeholder="Full Name" value={guarantor.full_name}
        onChange={(e) => setGuarantor({ ...guarantor, full_name: e.target.value })} />
      {errors.guarantor_name && <span className="field-error">{errors.guarantor_name}</span>}

      <input placeholder="Phone Number" value={guarantor.phone}
        onChange={(e) => setGuarantor({ ...guarantor, phone: e.target.value })} />
      {errors.guarantor_phone && <span className="field-error">{errors.guarantor_phone}</span>}

      <input placeholder="Address" value={guarantor.address}
        onChange={(e) => setGuarantor({ ...guarantor, address: e.target.value })} />

      <input placeholder="NIDA Number" value={guarantor.nida_number}
        onChange={(e) => setGuarantor({ ...guarantor, nida_number: e.target.value })} />
      {errors.guarantor_nida && <span className="field-error">{errors.guarantor_nida}</span>}

      <label>Start Date</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

      {errors.general && <div className="alert-error">{errors.general}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Generating Contract...' : 'Generate Contract'}
      </button>
    </form>
  );
}