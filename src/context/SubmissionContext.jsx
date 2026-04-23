import { createContext, useContext, useState } from 'react';

const SubmissionContext = createContext(null);

export function SubmissionProvider({ children }) {
  const [sellerInfo, setSellerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    venmo: '',
  });

  const [items, setItems] = useState([createEmptyItem()]);
  const [extraDonationPercent, setExtraDonationPercent] = useState('');
  const [submissionId, setSubmissionId] = useState(null);

  function createEmptyItem() {
    return {
      id: crypto.randomUUID(),
      category: '',
      description: '',
      brand: '',
      model: '',
      color: '',
      size: '',
      price: '',
      donateToBoec: false,
      sold: false,
    };
  }

  function addItem() {
    setItems(prev => [...prev, createEmptyItem()]);
  }

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function updateItem(id, field, value) {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function reset() {
    setSellerInfo({ firstName: '', lastName: '', email: '', phone: '', venmo: '' });
    setItems([createEmptyItem()]);
    setExtraDonationPercent('');
    setSubmissionId(null);
  }

  return (
    <SubmissionContext.Provider
      value={{
        sellerInfo,
        setSellerInfo,
        items,
        setItems,
        addItem,
        removeItem,
        updateItem,
        extraDonationPercent,
        setExtraDonationPercent,
        submissionId,
        setSubmissionId,
        createEmptyItem,
        reset,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error('useSubmission must be used within SubmissionProvider');
  return ctx;
}
