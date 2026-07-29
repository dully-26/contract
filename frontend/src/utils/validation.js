export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) =>
  /^[0-9+\s-]{7,15}$/.test(phone);

export const validateNida = (nida) =>
  /^\d{8}-\d{5}-\d{5}-\d{2}$/.test(nida) || /^\d{20}$/.test(nida.replace(/-/g, ''));

export const validateRegisterForm = ({ full_name, email, password, password_confirmation, phone }) => {
  const errors = {};
  if (!full_name || full_name.trim().length < 3) errors.full_name = 'Full name is required (min 3 chars)';
  if (!validateEmail(email)) errors.email = 'Enter a valid email address';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (password !== password_confirmation) errors.password_confirmation = 'Passwords do not match';
  if (phone && !validatePhone(phone)) errors.phone = 'Enter a valid phone number';
  return errors;
};

export const validateContractForm = ({ witness, guarantor }) => {
  const errors = {};
  if (!witness.full_name) errors.witness_name = 'Witness name required';
  if (!validateNida(witness.nida_number)) errors.witness_nida = 'Invalid NIDA number';
  if (!validatePhone(witness.phone)) errors.witness_phone = 'Invalid phone number';
  if (!guarantor.full_name) errors.guarantor_name = 'Guarantor name required';
  if (!validateNida(guarantor.nida_number)) errors.guarantor_nida = 'Invalid NIDA number';
  if (!validatePhone(guarantor.phone)) errors.guarantor_phone = 'Invalid phone number';
  return errors;
};

/**
 * Validates the Add/Edit Motorcycle form (manager/admin).
 * Rules differ depending on whether the listing is for contract or for sale.
 */
export const validateMotorcycleForm = ({
  brand, model, year, condition, listing_type,
  daily_price, monthly_price, total_contract_price, sale_price,
}) => {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!brand || brand.trim().length < 2) errors.brand = 'Brand is required';
  if (!model || model.trim().length < 1) errors.model = 'Model is required';

  if (!year || Number(year) < 1980 || Number(year) > currentYear + 1) {
    errors.year = `Enter a valid year (1980–${currentYear + 1})`;
  }

  if (!condition || !['new', 'used'].includes(condition)) {
    errors.condition = 'Select a valid condition';
  }

  if (!listing_type || !['contract', 'sale'].includes(listing_type)) {
    errors.listing_type = 'Select a valid listing type';
  }

  if (listing_type === 'contract') {
    if (!daily_price || Number(daily_price) <= 0) errors.daily_price = 'Enter a valid daily price';
    if (!monthly_price || Number(monthly_price) <= 0) errors.monthly_price = 'Enter a valid monthly price';
    if (!total_contract_price || Number(total_contract_price) <= 0) errors.total_contract_price = 'Enter a valid total contract price';

    if (
      total_contract_price && monthly_price &&
      Number(total_contract_price) < Number(monthly_price)
    ) {
      errors.total_contract_price = 'Total price cannot be less than the monthly price';
    }
  }

  if (listing_type === 'sale') {
    if (!sale_price || Number(sale_price) <= 0) errors.sale_price = 'Enter a valid selling price';
  }

  return errors;
};

/**
 * Validates the "Sell Your Motorcycle" marketplace form (customer-facing).
 */
export const validateSellForm = ({ brand, model, year, sale_price, condition }) => {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!brand || brand.trim().length < 2) errors.brand = 'Brand is required';
  if (!model || model.trim().length < 1) errors.model = 'Model is required';

  if (!year || Number(year) < 1980 || Number(year) > currentYear + 1) {
    errors.year = `Enter a valid year (1980–${currentYear + 1})`;
  }

  if (!sale_price || Number(sale_price) <= 0) {
    errors.sale_price = 'Enter a valid selling price';
  }

  if (!condition || !['new', 'used'].includes(condition)) {
    errors.condition = 'Select a valid condition';
  }

  return errors;
};

/**
 * Validates a cash payment being recorded by a manager for a customer's contract.
 */
export const validateCashPaymentForm = ({ contract_id, amount, balance }) => {
  const errors = {};

  if (!contract_id) errors.contract_id = 'Select a customer contract';

  const numericAmount = Number(amount);
  if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Enter a valid payment amount';
  } else if (balance !== undefined && numericAmount > Number(balance)) {
    errors.amount = 'Amount exceeds the outstanding balance';
  }

  return errors;
};

/**
 * Validates the "Request Contract" form submitted by a user,
 * which requires an applicant photo for accountability.
 */
export const validateContractRequestForm = ({ applicant_photo }) => {
  const errors = {};
  if (!applicant_photo) {
    errors.applicant_photo = 'Tafadhali pakia picha yako kabla ya kuwasilisha ombi';
  }
  return errors;
};