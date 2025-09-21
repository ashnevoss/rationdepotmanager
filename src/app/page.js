"use client";
import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Building2, Users, CreditCard, Plus, Search, Edit, Trash2, Phone, Hash, Calendar, UserCheck, AlertCircle, Download } from 'lucide-react';

const RationDepotApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [showAddDepotForm, setShowAddDepotForm] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showEditDepotForm, setShowEditDepotForm] = useState(false);
  const [showEditMemberForm, setShowEditMemberForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  
  // Data states
  const [depots, setDepots] = useState([]);
  const [rationCards, setRationCards] = useState([]);
  const [members, setMembers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadInitialData();
    }
  }, [isLoggedIn]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [depotsRes, cardsRes, membersRes] = await Promise.all([
        fetch('/api/depots'),
        fetch('/api/cards'), 
        fetch('/api/members')
      ]);
      
      const depotsData = await depotsRes.json();
      const cardsData = await cardsRes.json();
      const membersData = await membersRes.json();
      
      const depotsWithRowIndex = depotsData.map((d, index) => ({
        id: d.ID,
        name: d.Name,
        address: d.Address,
        createdAt: d.CreatedAt,
        updatedAt: d.UpdatedAt,
        rowIndex: index + 2
      }));

      const cardsWithRowIndex = cardsData.map((c, index) => ({
        id: c.ID,
        cardNumber: c.CardNumber,
        headOfFamily: c.HeadOfFamily,
        depotId: c.DepotID,
        createdAt: c.CreatedAt,
        rowIndex: index + 2
      }));

      const membersWithRowIndex = membersData.map((m, index) => ({
        id: m.ID,
        cardId: m.CardID,
        name: m.Name,
        dob: m.DOB,
        gender: m.Gender,
        maritalStatus: m.MaritalStatus,
        phone: m.Phone,
        aadhar: m.Aadhar,
        kycVerified: String(m.KYCVerified).toLowerCase() === 'true',
        kycReason: m.KYCReason,
        relation: m.Relation,
        createdAt: m.CreatedAt,
        rowIndex: index + 2
      }));

      setDepots(depotsWithRowIndex);
      setRationCards(cardsWithRowIndex);
      setMembers(membersWithRowIndex);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleAddDepot = async (formData) => {
    setLoading(true);
    try {
      const newDepot = {
        ID: Date.now().toString(),
        Name: formData.name,
        Address: formData.address,
      };
      
      const response = await fetch('/api/depots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepot)
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        await loadInitialData();
        setShowAddDepotForm(false);
      } else {
        alert('Failed to add depot. Please try again.');
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleAddCardWithHead = async (formData) => {
    setLoading(true);
    try {
      const cardId = Date.now().toString();
      const newCard = {
        ID: cardId,
        CardNumber: formData.cardNumber,
        HeadOfFamily: formData.name,
        DepotID: selectedDepot.id,
      };

      const cardResponse = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      const cardResult = await cardResponse.json();

      if (!cardResponse.ok || !cardResult.success) {
        throw new Error(cardResult.error || 'Failed to create the ration card.');
      }

      const newMember = {
        ID: (Date.now() + 1).toString(), // Ensure unique ID
        CardID: cardId,
        Name: formData.name,
        DOB: formData.dob,
        Gender: formData.gender,
        MaritalStatus: formData.maritalStatus,
        Phone: formData.phone,
        Aadhar: formData.aadhar,
        KYCVerified: formData.kycVerified ? 'TRUE' : 'FALSE',
        KYCReason: formData.kycReason,
        Relation: formData.relation,
      };

      const memberResponse = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      const memberResult = await memberResponse.json();

      if (!memberResponse.ok || !memberResult.success) {
        throw new Error(memberResult.error || 'Card was created, but failed to add the head of family.');
      }

      await loadInitialData();
      setShowAddCardForm(false);

    } catch (error) {
      console.error('Error in handleAddCardWithHead:', error);
      alert(`An error occurred: ${error.message}`);
    }
    setLoading(false);
  };


  const handleAddMember = async (formData) => {
    setLoading(true);
    try {
      const newMember = {
        ID: Date.now().toString(),
        CardID: selectedCard.id,
        Name: formData.name,
        DOB: formData.dob,
        Gender: formData.gender,
        MaritalStatus: formData.maritalStatus,
        Phone: formData.phone,
        Aadhar: formData.aadhar,
        KYCVerified: formData.kycVerified ? 'TRUE' : 'FALSE',
        KYCReason: formData.kycReason,
        Relation: formData.relation
      };
      
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        await loadInitialData();
        setShowAddMemberForm(false);
      } else {
        alert('Failed to add family member. Please try again.');
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleUpdateDepot = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        id: editingItem.id,
        rowIndex: editingItem.rowIndex,
        Name: formData.name,
        Address: formData.address,
        CreatedAt: editingItem.createdAt
      };

      const response = await fetch('/api/depots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        await loadInitialData();
        setShowEditDepotForm(false);
        setEditingItem(null);
      } else {
        alert('Failed to update depot. Please try again.');
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleUpdateMember = async (formData) => {
    setLoading(true);
    try {
        const payload = {
            id: editingItem.id,
            rowIndex: editingItem.rowIndex,
            CardID: editingItem.cardId,
            Name: formData.name,
            DOB: formData.dob,
            Gender: formData.gender,
            MaritalStatus: formData.maritalStatus,
            Phone: formData.phone,
            Aadhar: formData.aadhar,
            KYCVerified: formData.kycVerified ? 'TRUE' : 'FALSE',
            KYCReason: formData.kycReason,
            Relation: formData.relation,
            CreatedAt: editingItem.createdAt
        };

        const response = await fetch('/api/members', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // If the edited member is the head of the family, we may need to update the card record too
            if (payload.Relation === 'Self') {
                const cardToUpdate = rationCards.find(c => c.id === payload.CardID);
                if (cardToUpdate && cardToUpdate.headOfFamily !== payload.Name) {
                    await fetch('/api/cards', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: cardToUpdate.id,
                            rowIndex: cardToUpdate.rowIndex,
                            CardNumber: cardToUpdate.cardNumber,
                            HeadOfFamily: payload.Name, // Update the name on the card
                            DepotID: cardToUpdate.depotId,
                            CreatedAt: cardToUpdate.createdAt
                        })
                    });
                }
            }

            await loadInitialData();
            setShowEditMemberForm(false);
            setEditingItem(null);
        } else {
            alert('Failed to update family member. Please try again.');
        }
    } catch (error) {
        alert('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);
    
    let apiEndpoint = '';
    let type = deleteItem.type;

    try {
      if (type === 'depot') {
        apiEndpoint = '/api/depots';
      } else if (type === 'card') {
        apiEndpoint = '/api/cards';
      } else if (type === 'member') {
        apiEndpoint = '/api/members';
      }

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: deleteItem.rowIndex })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await loadInitialData();
        if (type === 'depot') {
          setCurrentPage('dashboard');
        } else if (type === 'card') {
          setCurrentPage('depot-detail');
        }
      } else {
        alert(`Failed to delete ${type}. Please try again.`);
      }
    } catch (error) {
      alert('An unexpected error occurred during deletion.');
    } finally {
      setShowDeleteModal(false);
      setDeleteItem(null);
      setLoading(false);
    }
  };

  const getMetrics = () => {
    const totalMembers = members.length;
    const totalCards = rationCards.length;
    const totalDepots = depots.length;
    const kycCompleted = members.filter(m => m.kycVerified).length;
    
    return { totalDepots, totalMembers, totalCards, kycCompleted };
  };

  const exportData = () => {
    const allData = rationCards.map(card => {
      const cardMembers = members.filter(m => m.cardId == card.id);
      const depot = depots.find(d => d.id == card.depotId);
      
      return cardMembers.map(member => ({
        'Depot Name': depot?.name || '',
        'Depot Address': depot?.address || '',
        'Card Number': card.cardNumber,
        'Head of Family': card.headOfFamily,
        'Member Name': member.name,
        'Relation': member.relation,
        'Date of Birth': member.dob,
        'Gender': member.gender,
        'Marital Status': member.maritalStatus,
        'Phone': member.phone,
        'Aadhaar': member.aadhar,
        'KYC Status': member.kycVerified ? 'Verified' : 'Pending',
        'KYC Issue': member.kycReason || ''
      }));
    }).flat();

    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(allData[0]);
    const csvContent = [
      headers.join(','),
      ...allData.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ration_depot_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- COMPONENT DEFINITIONS ---

  const modalOverlayStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  };

  const DeleteConfirmModal = () => (
    <div style={modalOverlayStyle} className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this {deleteItem?.type}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteItem(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const AddDepotForm = () => {
    const [formData, setFormData] = useState({ name: '', address: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.name && formData.address) {
        handleAddDepot(formData);
      }
    };

    return (
      <div style={modalOverlayStyle} className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Depot</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depot Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter depot name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter depot address"
                rows="3"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddDepotForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Depot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddCardForm = () => {
    const [formData, setFormData] = useState({
      cardNumber: '',
      name: '',
      dob: '',
      gender: 'Male',
      maritalStatus: 'Unmarried',
      phone: '',
      aadhar: '',
      relation: 'Self',
      kycVerified: false,
      kycReason: ''
    });
    // State for validation errors
    const [formErrors, setFormErrors] = useState({});

    // Universal change handler with validation
    const handleChange = (e) => {
      const { name, value } = e.target;
      let errors = { ...formErrors };
      let processedValue = value;

      switch (name) {
        case 'cardNumber':
          // Allow only numbers, max 12 digits
          processedValue = value.replace(/\D/g, '').slice(0, 12);
          if (processedValue.length > 0 && processedValue.length < 12) {
            errors.cardNumber = 'Card Number must be exactly 12 digits.';
          } else {
            delete errors.cardNumber;
          }
          break;
        case 'name':
          // Allow only letters and spaces
          processedValue = value.replace(/[^a-zA-Z\s]/g, '');
          if (processedValue.trim() === '' && value.length > 0) {
            errors.name = 'Name is required.';
          } else {
            delete errors.name;
          }
          break;
        case 'phone':
          // Allow only numbers, max 10 digits
          processedValue = value.replace(/\D/g, '').slice(0, 10);
          if (processedValue.length > 0 && processedValue.length < 10) {
            errors.phone = 'Phone number must be exactly 10 digits.';
          } else {
            delete errors.phone;
          }
          break;
        case 'aadhar':
          // Allow only numbers, max 12 digits
          processedValue = value.replace(/\D/g, '').slice(0, 12);
          if (processedValue.length > 0 && processedValue.length < 12) {
            errors.aadhar = 'Aadhaar number must be exactly 12 digits.';
          } else {
            delete errors.aadhar;
          }
          break;
        default:
          break;
      }
      
      setFormData(prev => ({ ...prev, [name]: processedValue }));
      setFormErrors(errors);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.cardNumber || formData.cardNumber.length !== 12) errors.cardNumber = 'Card Number must be exactly 12 digits.';
        if (!formData.name.trim()) errors.name = 'Full Name is required.';
        if (!formData.dob) errors.dob = 'Date of Birth is required.';
        if (formData.phone && formData.phone.length !== 10) errors.phone = 'Phone number must be exactly 10 digits.';
        if (!formData.aadhar || formData.aadhar.length !== 12) errors.aadhar = 'Aadhaar must be exactly 12 digits.';
        return errors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          return;
      }
      handleAddCardWithHead(formData);
    };

    return (
      <div style={modalOverlayStyle} className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Ration Card</h3>
          <p className="text-sm text-gray-600 mb-6">This will create a new ration card and add the Head of Family as the first member.</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <input
                  type="tel"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  maxLength="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12-digit number"
                  required
                />
                {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2">
                 <p className="font-semibold text-gray-800">Head of Family Details</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter head of family's full name"
                  required
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relation *</label>
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                {formErrors.dob && <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10-digit phone number"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  maxLength="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12-digit Aadhaar number"
                  required
                />
                {formErrors.aadhar && <p className="text-red-500 text-xs mt-1">{formErrors.aadhar}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kycVerified}
                    onChange={(e) => setFormData({...formData, kycVerified: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">KYC Verified</span>
                </label>
              </div>
              {!formData.kycVerified && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for KYC Pending</label>
                  <textarea
                    value={formData.kycReason}
                    onChange={(e) => setFormData({...formData, kycReason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter reason why KYC is not completed"
                    rows="2"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddCardForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || Object.values(formErrors).some(error => error)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Card & Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  const MemberForm = ({ 
    isEdit = false, 
    onClose 
  }) => {
    const [formData, setFormData] = useState({
      name: isEdit ? editingItem?.name || '' : '',
      dob: isEdit ? editingItem?.dob || '' : '',
      gender: isEdit ? editingItem?.gender || 'Male' : 'Male',
      maritalStatus: isEdit ? editingItem?.maritalStatus || 'Unmarried' : 'Unmarried',
      phone: isEdit ? editingItem?.phone || '' : '',
      aadhar: isEdit ? editingItem?.aadhar || '' : '',
      relation: isEdit ? editingItem?.relation || '' : '',
      kycVerified: isEdit ? editingItem?.kycVerified || false : false,
      kycReason: isEdit ? editingItem?.kycReason || '' : ''
    });
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      let errors = { ...formErrors };
      let processedValue = value;

      switch (name) {
        case 'name':
          processedValue = value.replace(/[^a-zA-Z\s]/g, '');
          if (processedValue.trim() === '' && value.length > 0) {
            errors.name = 'Name is required.';
          } else {
            delete errors.name;
          }
          break;
        case 'phone':
          processedValue = value.replace(/\D/g, '').slice(0, 10);
          if (processedValue.length > 0 && processedValue.length < 10) {
            errors.phone = 'Phone number must be exactly 10 digits.';
          } else {
            delete errors.phone;
          }
          break;
        case 'aadhar':
          processedValue = value.replace(/\D/g, '').slice(0, 12);
          if (processedValue.length > 0 && processedValue.length < 12) {
            errors.aadhar = 'Aadhaar number must be exactly 12 digits.';
          } else {
            delete errors.aadhar;
          }
          break;
        default:
          break;
      }

      setFormData(prev => ({ ...prev, [name]: processedValue }));
      setFormErrors(errors);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full Name is required.';
        if (!formData.relation.trim()) errors.relation = 'Relation is required.';
        if (!formData.dob) errors.dob = 'Date of Birth is required.';
        if (formData.phone && formData.phone.length !== 10) errors.phone = 'Phone number must be exactly 10 digits.';
        if (!formData.aadhar || formData.aadhar.length !== 12) errors.aadhar = 'Aadhaar must be exactly 12 digits.';
        return errors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          return;
      }

      if (isEdit) {
        handleUpdateMember(formData);
      } else {
        handleAddMember(formData);
      }
    };

    return (
      <div style={modalOverlayStyle} className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {isEdit ? 'Edit' : 'Add New'} Family Member
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relation *</label>
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  onChange={(e) => setFormData({...formData, relation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Father, Mother, Son"
                  readOnly={isEdit && editingItem?.relation === 'Self'}
                  required
                />
                {formErrors.relation && <p className="text-red-500 text-xs mt-1">{formErrors.relation}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                {formErrors.dob && <p className="text-red-500 text-xs mt-1">{formErrors.dob}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10-digit phone number"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  maxLength="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12-digit Aadhaar number"
                  required
                />
                {formErrors.aadhar && <p className="text-red-500 text-xs mt-1">{formErrors.aadhar}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kycVerified}
                    onChange={(e) => setFormData({...formData, kycVerified: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">KYC Verified</span>
                </label>
              </div>
              {!formData.kycVerified && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for KYC Pending</label>
                  <textarea
                    value={formData.kycReason}
                    onChange={(e) => setFormData({...formData, kycReason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter reason why KYC is not completed"
                    rows="2"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || Object.values(formErrors).some(error => error)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Member' : 'Add Member')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
      // Check for the hardcoded username and password
      if (username === 'foodsd' && password === 'fsd#25') {
        setError(''); // Clear any previous errors
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      } else {
        setError('Invalid username or password.');
      }
    };

    // Allow pressing 'Enter' to log in
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 rounded-full p-3 inline-block mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Ration Depot</h1>
            <p className="text-gray-600">Management System</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(''); // Clear error on new input
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error on new input
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button 
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 transform hover:translate-y-[-1px] shadow-lg hover:shadow-xl"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const metrics = getMetrics();
    
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Overview of all ration depots and statistics</p>
            </div>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Depots</p>
                <p className="text-3xl font-bold">{metrics.totalDepots}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Members</p>
                <p className="text-3xl font-bold">{metrics.totalMembers}</p>
              </div>
              <Users className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Ration Cards</p>
                <p className="text-3xl font-bold">{metrics.totalCards}</p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">KYC Completed</p>
                <p className="text-3xl font-bold">{metrics.kycCompleted}</p>
              </div>
              <UserCheck className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">All Depots</h2>
            <button 
              onClick={() => setShowAddDepotForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Depot
            </button>
          </div>

          <div className="grid gap-4">
            {depots.map((depot) => {
              const depotCards = rationCards.filter(c => c.depotId == depot.id);
              const depotMembers = members.filter(m => depotCards.some(c => c.id == m.cardId));
              
              return (
                <div 
                  key={depot.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-indigo-300"
                  onClick={() => {
                    setSelectedDepot(depot);
                    setCurrentPage('depot-detail');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{depot.name}</h3>
                      <p className="text-gray-600 mb-3">{depot.address}</p>
                      <div className="flex gap-6 text-sm">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-purple-500" />
                          <strong>{depotCards.length}</strong> Cards
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-green-500" />
                          <strong>{depotMembers.length}</strong> Members
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(depot);
                          setShowEditDepotForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteItem({ ...depot, type: 'depot' });
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const EditDepotForm = () => {
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      address: editingItem?.address || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.name && formData.address) {
        handleUpdateDepot(formData);
      }
    };

    return (
      <div style={modalOverlayStyle} className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Depot</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depot Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditDepotForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Depot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DepotDetail = () => {
    if (!selectedDepot) return null;
    const depotCards = rationCards.filter(card => card.depotId == selectedDepot.id);
    const depotMembers = members.filter(m => depotCards.some(c => c.id == m.cardId));

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedDepot.name}</h1>
              <p className="text-gray-600">{selectedDepot.address}</p>
            </div>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-left"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Total Cards</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{depotCards.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Total Members</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{depotMembers.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">KYC Completed</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {depotMembers.filter(m => m.kycVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Ration Cards</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowAddCardForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {depotCards
              .filter(card => {
                const headMember = members.find(m => m.cardId == card.id && m.relation === 'Self');
                return card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (headMember && headMember.name.toLowerCase().includes(searchTerm.toLowerCase()));
              })
              .map((card) => {
                const cardMembers = members.filter(m => m.cardId == card.id);
                const headOfFamilyMember = cardMembers.find(m => m.relation === 'Self');
                
                return (
                  <div 
                    key={card.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-indigo-300"
                    onClick={() => {
                      setSelectedCard(card);
                      setCurrentPage('card-detail');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.cardNumber}</h3>
                        <p className="text-lg text-gray-700 mb-3">
                          Head: <strong>{headOfFamilyMember?.name || 'N/A'}</strong>
                        </p>
                        
                        {headOfFamilyMember ? (
                          <div className="border-l-4 border-indigo-200 pl-4 mb-4 text-sm space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{headOfFamilyMember.phone || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Hash className="w-4 h-4 flex-shrink-0" />
                              <span>{headOfFamilyMember.aadhar}</span>
                            </div>
                            <div className="pt-1">
                              {headOfFamilyMember.kycVerified ? (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  KYC Verified
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  KYC Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="pl-4 mb-4 text-sm text-red-600">
                            Head of Family member data is missing.
                          </div>
                        )}

                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            <strong>{cardMembers.length}</strong> Members
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <strong>{cardMembers.filter(m => m.kycVerified).length}</strong> KYC Verified
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (headOfFamilyMember) {
                              setEditingItem(headOfFamilyMember);
                              setShowEditMemberForm(true);
                            } else {
                              alert('Head of family details not found. Cannot edit.');
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Head of Family"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteItem({ ...card, type: 'card' });
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  };

  const CardDetail = () => {
    if (!selectedCard) return null;
    const cardMembers = members.filter(m => m.cardId == selectedCard.id);
    const headOfFamilyMember = cardMembers.find(m => m.relation === 'Self');

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCard.cardNumber}</h1>
              <p className="text-gray-600">Head of Family: {headOfFamilyMember?.name || 'N/A'}</p>
            </div>
            <button 
              onClick={() => setCurrentPage('depot-detail')}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-left"
            >
              ← Back to Depot
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Family Members</h2>
            <button 
              onClick={() => setShowAddMemberForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          <div className="grid gap-6">
            {cardMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{member.relation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.kycVerified ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        KYC Verified
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        KYC Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{member.dob}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-gray-900 mt-1">{member.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Marital Status</label>
                    <p className="text-gray-900 mt-1">{member.maritalStatus}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{member.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{member.aadhar}</p>
                    </div>
                  </div>
                  {!member.kycVerified && member.kycReason && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium text-red-600">KYC Issue</label>
                      <p className="text-red-800 mt-1 bg-red-50 p-2 rounded">{member.kycReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setEditingItem(member);
                      setShowEditMemberForm(true);
                    }}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteItem({ ...member, type: 'member' });
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Ration Depot Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentPage('login');
                }}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)'}} className="fixed inset-0 flex items-center justify-center z-[60]">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {children}
      </main>
    </div>
  );
  
  // --- MAIN RENDER LOGIC ---

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Layout>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'depot-detail' && <DepotDetail />}
      {currentPage === 'card-detail' && <CardDetail />}
      
      {showAddDepotForm && <AddDepotForm />}
      {showAddCardForm && <AddCardForm />}
      {showEditDepotForm && <EditDepotForm />}
      {showDeleteModal && <DeleteConfirmModal />}

      {showAddMemberForm && (
        <MemberForm 
          isEdit={false} 
          onClose={() => setShowAddMemberForm(false)} 
        />
      )}
      {showEditMemberForm && (
        <MemberForm 
          isEdit={true} 
          onClose={() => {
            setShowEditMemberForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </Layout>
  );
};

export default RationDepotApp;