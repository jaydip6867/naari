import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSubcategoryModal from './CreateSubcategoryModal.js';
import RollModal from './RollModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';

const Settings = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('measurements');
  const [selectedOutfit, setSelectedOutfit] = useState('Salwar Kameez');
  const [newOutfitType, setNewOutfitType] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('inch');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [workerRolls, setWorkerRolls] = useState([
    { id: 1, name: 'Admin', permissions: { dashboard: { canView: true, canAddEdit: true }, orders: { canView: true, canAddEdit: true }, workers: { canView: true, canAddEdit: true }, tasks: { canView: true, canAddEdit: true }, settings: { canView: true, canAddEdit: true } } },
    { id: 2, name: 'Manager', permissions: { dashboard: { canView: true, canAddEdit: false }, orders: { canView: true, canAddEdit: true }, workers: { canView: true, canAddEdit: true }, tasks: { canView: true, canAddEdit: true }, settings: { canView: false, canAddEdit: false } } },
    { id: 3, name: 'Tailor', permissions: { dashboard: { canView: false, canAddEdit: false }, orders: { canView: true, canAddEdit: false }, workers: { canView: false, canAddEdit: false }, tasks: { canView: true, canAddEdit: false }, settings: { canView: false, canAddEdit: false } } }
  ]);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);

  const [outfitTypes, setOutfitTypes] = useState([
    { 
      id: 1, 
      name: 'Salwar Kameez', 
      subcategories: ['Classic', 'Anarkali', 'Patiala']
    },
    { 
      id: 2, 
      name: 'Lehenga', 
      subcategories: ['Bridal', 'Party Wear', 'Traditional']
    },
    { 
      id: 3, 
      name: 'Saree Blouse', 
      subcategories: ['Designer', 'Simple', 'Party']
    },
    { 
      id: 4, 
      name: 'Kurta', 
      subcategories: []
    },
    { 
      id: 5, 
      name: 'Sherwani', 
      subcategories: []
    },
    { 
      id: 6, 
      name: 'Chaniya Choli', 
      subcategories: []
    },
    { 
      id: 7, 
      name: 'Blowse', 
      subcategories: []
    },
    { 
      id: 8, 
      name: 'Chaniya', 
      subcategories: []
    },
    { 
      id: 9, 
      name: 'Gown', 
      subcategories: []
    }
  ]);

  const [categoryFields, setCategoryFields] = useState({
    'Salwar Kameez': [
      { id: 1, name: 'Chest', unit: 'inch', required: false },
      { id: 2, name: 'Waist', unit: 'inch', required: true },
      { id: 3, name: 'Hip', unit: 'inch', required: false },
      { id: 4, name: 'Shoulder', unit: 'inch', required: false },
      { id: 5, name: 'Arm Length', unit: 'inch', required: false }
    ],
    'Lehenga': [
      { id: 1, name: 'Waist', unit: 'inch', required: true },
      { id: 2, name: 'Hip', unit: 'inch', required: true },
      { id: 3, name: 'Length', unit: 'inch', required: true },
      { id: 4, name: 'Choli Chest', unit: 'inch', required: false }
    ],
    'Saree Blouse': [
      { id: 1, name: 'Chest', unit: 'inch', required: true },
      { id: 2, name: 'Waist', unit: 'inch', required: false },
      { id: 3, name: 'Shoulder', unit: 'inch', required: false },
      { id: 4, name: 'Arm Length', unit: 'inch', required: false },
      { id: 5, name: 'Blouse Length', unit: 'inch', required: false }
    ],
    'Kurta': [
      { id: 1, name: 'Chest', unit: 'inch', required: true },
      { id: 2, name: 'Shoulder', unit: 'inch', required: false },
      { id: 3, name: 'Length', unit: 'inch', required: true },
      { id: 4, name: 'Sleeve Length', unit: 'inch', required: false }
    ],
    'Sherwani': [
      { id: 1, name: 'Chest', unit: 'inch', required: true },
      { id: 2, name: 'Waist', unit: 'inch', required: true },
      { id: 3, name: 'Shoulder', unit: 'inch', required: false },
      { id: 4, name: 'Length', unit: 'inch', required: true },
      { id: 5, name: 'Arm Length', unit: 'inch', required: false }
    ],
    'Chaniya Choli': [
      { id: 1, name: 'Choli Chest', unit: 'inch', required: true },
      { id: 2, name: 'Waist', unit: 'inch', required: true },
      { id: 3, name: 'Hip', unit: 'inch', required: true },
      { id: 4, name: 'Chaniya Length', unit: 'inch', required: true }
    ],
    'Blowse': [
      { id: 1, name: 'Chest', unit: 'inch', required: true },
      { id: 2, name: 'Waist', unit: 'inch', required: false },
      { id: 3, name: 'Shoulder', unit: 'inch', required: false },
      { id: 4, name: 'Length', unit: 'inch', required: true },
      { id: 5, name: 'Sleeve Length', unit: 'inch', required: false }
    ],
    'Chaniya': [
      { id: 1, name: 'Waist', unit: 'inch', required: true },
      { id: 2, name: 'Hip', unit: 'inch', required: true },
      { id: 3, name: 'Length', unit: 'inch', required: true }
    ],
    'Gown': [
      { id: 1, name: 'Chest', unit: 'inch', required: true },
      { id: 2, name: 'Waist', unit: 'inch', required: true },
      { id: 3, name: 'Hip', unit: 'inch', required: false },
      { id: 4, name: 'Length', unit: 'inch', required: true },
      { id: 5, name: 'Shoulder', unit: 'inch', required: false }
    ]
  });

  const tabs = [
    { id: 'measurements', label: 'Measurements' },
    { id: 'rolls', label: 'Rolls' },
    { id: 'skills', label: 'Skills' },
    { id: 'worktype', label: 'Work Type' },
    { id: 'staff', label: 'Staff Account' }
  ];

  

  const addOutfitType = () => {
    if (newOutfitType.trim()) {
      const newOutfit = {
        id: outfitTypes.length + 1,
        name: newOutfitType,
        subcategories: []
      };
      setOutfitTypes([...outfitTypes, newOutfit]);
      
      // Initialize empty fields array for the new outfit type
      setCategoryFields(prev => ({
        ...prev,
        [newOutfitType]: []
      }));
      
      setNewOutfitType('');
    }
  };

  const deleteOutfitType = (id) => {
    const outfitToDelete = outfitTypes.find(outfit => outfit.id === id);
    if (outfitToDelete) {
      setOutfitTypes(outfitTypes.filter(outfit => outfit.id !== id));
      
      // Remove fields for the deleted outfit type
      setCategoryFields(prev => {
        const newFields = { ...prev };
        delete newFields[outfitToDelete.name];
        return newFields;
      });
      
      // If the deleted outfit was selected, select the first available outfit
      if (selectedOutfit === outfitToDelete.name) {
        const remainingOutfits = outfitTypes.filter(outfit => outfit.id !== id);
        if (remainingOutfits.length > 0) {
          setSelectedOutfit(remainingOutfits[0].name);
        }
      }
    }
  };

  const addMeasurementField = () => {
    if (newFieldName.trim()) {
      const currentFields = categoryFields[selectedOutfit] || [];
      const newField = {
        id: Math.max(...currentFields.map(f => f.id), 0) + 1,
        name: newFieldName,
        unit: newFieldUnit,
        required: newFieldRequired
      };
      
      setCategoryFields(prev => ({
        ...prev,
        [selectedOutfit]: [...currentFields, newField]
      }));
      
      // Update the outfit's field count
      setOutfitTypes(prev => prev.map(outfit => 
        outfit.name === selectedOutfit 
          ? { ...outfit, fields: currentFields.length + 1 }
          : outfit
      ));
      
      setNewFieldName('');
      setNewFieldRequired(false);
    }
  };

  const deleteMeasurementField = (id) => {
    const currentFields = categoryFields[selectedOutfit] || [];
    const updatedFields = currentFields.filter(field => field.id !== id);
    
    setCategoryFields(prev => ({
      ...prev,
      [selectedOutfit]: updatedFields
    }));
    
    // Update the outfit's field count
    setOutfitTypes(prev => prev.map(outfit => 
      outfit.name === selectedOutfit 
        ? { ...outfit, fields: updatedFields.length }
        : outfit
    ));
  };

  const toggleFieldRequired = (id) => {
    const currentFields = categoryFields[selectedOutfit] || [];
    const updatedFields = currentFields.map(field =>
      field.id === id ? { ...field, required: !field.required } : field
    );
    
    setCategoryFields(prev => ({
      ...prev,
      [selectedOutfit]: updatedFields
    }));
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const openSubcategoryModal = () => {
    setIsSubcategoryModalOpen(true);
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
  };

  const deleteSubcategory = (outfitName, subcategoryIndex) => {
    setOutfitTypes(prevOutfits => 
      prevOutfits.map(outfit => 
        outfit.name === outfitName 
          ? { 
              ...outfit, 
              subcategories: outfit.subcategories.filter((_, index) => index !== subcategoryIndex)
            }
          : outfit
      )
    );
  };

  const saveSubcategory = (subcategoryName) => {
    // Add the subcategory to the selected outfit
    setOutfitTypes(prevOutfits => 
      prevOutfits.map(outfit => 
        outfit.name === selectedOutfit 
          ? { ...outfit, subcategories: [...(outfit.subcategories || []), subcategoryName] }
          : outfit
      )
    );
    console.log('Saving subcategory:', subcategoryName, 'to', selectedOutfit);
    return Promise.resolve();
  };

  // Roll management functions
  const openRollModal = (roll = null) => {
    setEditingRoll(roll);
    setIsRollModalOpen(true);
  };

  const closeRollModal = () => {
    setEditingRoll(null);
    setIsRollModalOpen(false);
  };

  const saveRoll = (rollData) => {
    if (editingRoll) {
      // Edit existing roll
      setWorkerRolls(prev => prev.map(roll => 
        roll.id === editingRoll.id ? rollData : roll
      ));
    } else {
      // Add new roll
      setWorkerRolls(prev => [...prev, rollData]);
    }
    return Promise.resolve();
  };

  const deleteRoll = (rollId) => {
    setWorkerRolls(prev => prev.filter(roll => roll.id !== rollId));
  };

  // Drag and drop handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem(item);
    setDraggedItemType(type);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedItem(null);
    setDraggedItemType(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItemType !== targetType) {
      return;
    }

    if (targetType === 'field') {
      const currentFields = categoryFields[selectedOutfit] || [];
      const newFields = [...currentFields];
      const draggedIndex = newFields.findIndex(field => field.id === draggedItem.id);
      const targetIndex = newFields.findIndex(field => field.id === targetItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIndex, 0, removed);
        setCategoryFields(prev => ({
          ...prev,
          [selectedOutfit]: newFields
        }));
      }
    } else if (targetType === 'roll') {
      const newRolls = [...workerRolls];
      const draggedIndex = newRolls.findIndex(roll => roll.id === draggedItem.id);
      const targetIndex = newRolls.findIndex(roll => roll.id === targetItem.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newRolls.splice(draggedIndex, 1);
        newRolls.splice(targetIndex, 0, removed);
        setWorkerRolls(newRolls);
      }
    }
  };

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Measurements Tab Content */}
        {activeTab === 'measurements' && (
          <div className="content-sections-wrapper">
            {/* Outfit Types Section */}
            <div className="content-section outfit-types-section">
              <div className="section-header">
                <h2 className="section-title">Outfit Types</h2>
              </div>
              
              <div className="add-field-container">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter to add Field"
                  value={newOutfitType}
                  onChange={(e) => setNewOutfitType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutfitType()}
                />
                <button className="add-btn" onClick={addOutfitType}>
                  + Add
                </button>
              </div>

              <div className="outfit-list">
                {outfitTypes.map(outfit => (
                  <React.Fragment key={outfit.id}>
                    <div
                      className={`outfit-item ${selectedOutfit === outfit.name ? 'selected' : ''}`}
                      onClick={() => setSelectedOutfit(outfit.name)}
                    >
                      <div className="outfit-content">
                        <span className="outfit-name">{outfit.name}</span>
                        <span className="outfit-fields-tag">{(categoryFields[outfit.name]?.length || 0).toString().padStart(2, '0')} Fields</span>
                      </div>
                      <svg
                        className="delete-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOutfitType(outfit.id);
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    
                    {/* Display subcategories below each outfit */}
                    {outfit.subcategories && outfit.subcategories.length > 0 && (
                      <div className="subcategories-list">
                        {outfit.subcategories.map((subcategory, index) => (
                          <div key={index} className="subcategory-item">
                            <div className="subcategory-content">
                              <span className="subcategory-name">{subcategory}</span>
                              <span className="subcategory-fields-tag">05 Fields</span>
                            </div>
                            <svg
                              className="subcategory-delete"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSubcategory(outfit.name, index);
                              }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Measurement Fields Section */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">{selectedOutfit} ({(categoryFields[selectedOutfit]?.length || 0).toString().padStart(2, '0')} Fields)</h2>
                <button className="add-btn" onClick={openSubcategoryModal}>+ Sub Category Add</button>
              </div>

              <div className="measurement-fields">
                <div className="field-input-container">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter Field Name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                  <select
                    className="dropdown"
                    value={newFieldUnit}
                    onChange={(e) => setNewFieldUnit(e.target.value)}
                  >
                    <option value="inch">In</option>
                    <option value="cm">Cm</option>
                    <option value="feet">Feet</option>
                  </select>
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      className="checkbox"
                      id="required"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                    />
                    <label htmlFor="required" className="checkbox-label">Required</label>
                  </div>
                  <button className="add-btn" onClick={addMeasurementField}>
                    + Add Field
                  </button>
                </div>

                <div className="field-list">
                  {(categoryFields[selectedOutfit] || []).map(field => (
                    <div 
                      key={field.id} 
                      className="field-item draggable-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, field, 'field')}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, field, 'field')}
                    >
                      <svg className="drag-handle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <div className="field-name">{field.name}</div>
                      <select className="dropdown" value={field.unit}>
                        <option value="inch">In</option>
                        <option value="cm">Cm</option>
                        <option value="feet">Feet</option>
                      </select>
                      <div className="required-checkbox">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={field.required}
                          onChange={() => toggleFieldRequired(field.id)}
                        />
                        <label className="checkbox-label">Required</label>
                      </div>
                      <svg
                        className="field-delete"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={() => deleteMeasurementField(field.id)}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs (placeholder content) */}
        {activeTab === 'rolls' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Rolls Configuration</h2>
              <button className="add-btn" onClick={() => openRollModal()}>+ Add New Roll</button>
            </div>
            
            <div className="rolls-list">
              {workerRolls.map(roll => (
                <div 
                  key={roll.id} 
                  className="roll-item draggable-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, roll, 'roll')}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, roll, 'roll')}
                >
                  <div className="roll-info">
                    <svg className="drag-handle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <div className="roll-details">
                      <div className="roll-name">{roll.name}</div>
                      <div className="roll-permissions-summary">
                        {Object.entries(roll.permissions).filter(([_, perms]) => perms.canView).length} sections accessible
                      </div>
                    </div>
                  </div>
                  <div className="roll-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => openRollModal(roll)}
                    >
                      Edit
                    </button>
                    <svg
                      className="delete-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      onClick={() => deleteRoll(roll.id)}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'measurements' && activeTab !== 'rolls' && (
          <div className="content-section">
            <h2 className="section-title">{tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <p style={{ color: '#6b7280' }}>Content for {tabs.find(tab => tab.id === activeTab)?.label} will be implemented here.</p>
          </div>
        )}

        {/* Subcategory Modal */}
        <CreateSubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={closeSubcategoryModal}
          onSave={saveSubcategory}
        />

        {/* Roll Modal */}
        <RollModal
          isOpen={isRollModalOpen}
          onClose={closeRollModal}
          onSave={saveRoll}
          editingRoll={editingRoll}
        />
      </div>
    </div>
  );
};

export default Settings;
