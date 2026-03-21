import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSubcategoryModal from './CreateSubcategoryModal.js';
import RollModal from './RollModal.js';
import SkillModal from './SkillModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { userRoleAPI, skillsAPI } from '../services/api';
import { FiEdit, FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi';
import { RxDragHandleDots2 } from 'react-icons/rx';

const Settings = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('measurements');
  const [selectedOutfit, setSelectedOutfit] = useState('Salwar Kameez');
  const [newOutfitType, setNewOutfitType] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('inch');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  // const [editingRole, setEditingRole] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  // Fetch user roles when component mounts
  useEffect(() => {
    fetchUserRoles();
    fetchSkills();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const roles = await userRoleAPI.listRoles('');
      setUserRoles(roles || []);
      // console.log('User roles fetched:', roles);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError(err.message || 'Failed to fetch user roles');
    } finally {
      setLoading(false);
    }
  };

  // const openRoleModal = (role = null) => {
  //   setEditingRole(role);
  //   setIsRoleModalOpen(true);
  // };

  // const closeRoleModal = () => {
  //   setIsRoleModalOpen(false);
  //   setEditingRole(null);
  // };

  // const saveRole = async (roleData) => {
  //   try {
  //     const savedRole = await userRoleAPI.saveRole(roleData);
  //     console.log('Role saved:', savedRole);

  //     // Refresh the roles list
  //     await fetchUserRoles();

  //     return savedRole;
  //   } catch (err) {
  //     console.error('Error saving role:', err);
  //     throw err;
  //   }
  // };

  // Skills management functions
  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      setSkillsError('');
      const skillsData = await skillsAPI.getSkills();
      setSkills(skillsData || []);
      // console.log('Skills fetched:', skillsData);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setSkillsError(err.message || 'Failed to fetch skills');
    } finally {
      setSkillsLoading(false);
    }
  };

  // const addSkill = async (skillName) => {
  //   try {
  //     setSkillsLoading(true);
  //     setSkillsError('');
      
  //     const skillData = {
  //       name: skillName,
  //       type: 'Add'
  //     };
      
  //     const savedSkill = await skillsAPI.saveSkill(skillData);
  //     console.log('Skill added:', savedSkill);
      
  //     // Refresh the skills list
  //     await fetchSkills();
      
  //     return savedSkill;
  //   } catch (err) {
  //     console.error('Error adding skill:', err);
  //     setSkillsError(err.message || 'Failed to add skill');
  //     throw err;
  //   } finally {
  //     setSkillsLoading(false);
  //   }
  // };

  // const deleteSkill = async (skillId, skillName) => {
  //   try {
  //     setSkillsLoading(true);
  //     setSkillsError('');
      
  //     const skillData = {
  //       name: skillName,
  //       type: 'Remove'
  //     };
      
  //     await skillsAPI.saveSkill(skillData);
  //     console.log('Skill removed:', skillName);
      
  //     // Refresh the skills list
  //     await fetchSkills();
  //   } catch (err) {
  //     console.error('Error removing skill:', err);
  //     setSkillsError(err.message || 'Failed to remove skill');
  //     throw err;
  //   } finally {
  //     setSkillsLoading(false);
  //   }
  // };

  // Skill Modal functions
  const openSkillModal = (skill = null) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
  };

  const closeSkillModal = () => {
    setIsSkillModalOpen(false);
    setEditingSkill(null);
  };

  const saveSkill = async (skillData) => {
    try {
      const savedSkill = await skillsAPI.saveSkill(skillData);
      console.log('Skill saved:', savedSkill);
      
      // Refresh the skills list
      await fetchSkills();
      
      return savedSkill;
    } catch (err) {
      console.error('Error saving skill:', err);
      throw err;
    }
  };

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);
  const [draggedRollIndex, setDraggedRollIndex] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState('');

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

  const saveRoll = async (rollData) => {
    try {
      const savedRoll = await userRoleAPI.saveRole(rollData);
      console.log('Roll saved:', savedRoll);

      // Refresh the roles list
      await fetchUserRoles();

      closeRollModal();
      return savedRoll;
    } catch (err) {
      console.error('Error saving roll:', err);
      throw err;
    }
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

  const handleDrop = (e, targetItem, targetType, targetIndex = null) => {
    e.preventDefault();

    if (draggedItem && draggedItemType === 'measurementField' && targetType === 'measurementField') {
      const currentFields = categoryFields[selectedOutfit] || [];
      const draggedIndex = currentFields.findIndex(field => field.id === draggedItem.id);
      const targetIndex = currentFields.findIndex(field => field.id === targetItem.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newFields = [...currentFields];
        const [removed] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIndex, 0, removed);
        setCategoryFields(prev => ({
          ...prev,
          [selectedOutfit]: newFields
        }));
      }
    } else if (draggedItemType === 'roll' && targetType === 'roll' && targetIndex !== null) {
      // Handle roll reordering
      const newRolls = [...userRoles];
      const draggedIdx = draggedRollIndex;

      if (draggedIdx !== null && draggedIdx !== targetIndex) {
        const [removed] = newRolls.splice(draggedIdx, 1);
        newRolls.splice(targetIndex, 0, removed);
        setUserRoles(newRolls);
      }
    }

    // Reset drag state
    setDraggedItem(null);
    setDraggedItemType(null);
    setDraggedRollIndex(null);
  };

  // Roll-specific drag handlers
  const handleRollDragStart = (e, roll, index) => {
    setDraggedItem(roll);
    setDraggedItemType('roll');
    setDraggedRollIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleRollDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedItem(null);
    setDraggedItemType(null);
    setDraggedRollIndex(null);
  };

  const handleRollDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
                  className="input-field measurements_input"
                  placeholder="Enter to add Field"
                  value={newOutfitType}
                  onChange={(e) => setNewOutfitType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutfitType()}
                />
                <button className="add-btn measurements_add_btn" onClick={addOutfitType}>
                  Add
                </button>
              </div>

              <div className="outfit-list">
                {outfitTypes.map(outfit => (
                  <React.Fragment key={outfit.id}>
                    <div
                      className={`outfit-item ${selectedOutfit === outfit.name ? 'selected' : ''}`}
                      onClick={() => setSelectedOutfit(outfit.name)}
                    >
                      <span className="outfit-name">{outfit.name}</span>
                      <div className="outfit-content">
                        <span className="outfit-fields-tag">{(categoryFields[outfit.name]?.length || 0).toString().padStart(2, '0')} Fields</span>
                        <FiTrash2 className='delete-icon' onClick={(e) => {
                          e.stopPropagation();
                          deleteOutfitType(outfit.id);
                        }} />
                      </div>
                    </div>

                    {/* Display subcategories below each outfit */}
                    {outfit.subcategories && outfit.subcategories.length > 0 && (
                      <div className="subcategories-list">
                        {outfit.subcategories.map((subcategory, index) => (
                          <div key={index} className="subcategory-item">
                            <span className="subcategory-name">{subcategory}</span>
                            <div className="subcategory-content">
                              <span className="subcategory-fields-tag">05 Fields</span>
                              <FiTrash2 className='delete-icon' onClick={(e) => {
                                e.stopPropagation();
                                deleteSubcategory(outfit.name, index);
                              }} />
                            </div>
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
                <h2 className="section-title">{selectedOutfit} <span className='fields-tag'>{(categoryFields[selectedOutfit]?.length || 0).toString().padStart(2, '0')} Fields</span></h2>
                <button className="add-btn" onClick={openSubcategoryModal}>+ Sub Category Add</button>
              </div>

              <div className="measurement-fields">
                <div className="field-input-container">
                  <input
                    type="text"
                    className="field-input subcategory_input"
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
                      onDragStart={(e) => handleDragStart(e, field, 'measurementField')}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, field, 'measurementField')}
                    >
                      <RxDragHandleDots2 />
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
              <h2 className="section-title">Worker Rolls <span className='fields-tag'>{userRoles.length} Rolls</span></h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="add-btn" onClick={fetchUserRoles}><FiRefreshCw /> Refresh</button>
                <button className="add-btn" onClick={() => openRollModal()}>Add New Roll</button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                Loading rolls...
              </div>
            ) : userRoles.length > 0 ? (
              <div className="rolls-list">
                {userRoles.map((roll, index) => (
                  <div
                    key={roll._id || index}
                    className="roll-item draggable-item"
                    draggable
                    onDragStart={(e) => handleRollDragStart(e, roll, index)}
                    onDragEnd={handleRollDragEnd}
                    onDragOver={handleRollDragOver}
                    onDrop={(e) => handleDrop(e, roll, 'roll', index)}
                  >
                    <div className="roll-info">
                      <RxDragHandleDots2 />
                      <div className="roll-details">
                        <div className="roll-name">{roll.name || `Roll ${index + 1}`}</div>
                      </div>
                    </div>
                    <div className="roll-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openRollModal(roll)}
                      >
                        <FiEdit />
                      </button>
                    </div>
                    <div className="roll-actions">
                      <button
                        className="delete-btn"
                      // onClick={() => deleteUserRole(roll._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                No rolls found
                <div style={{ marginTop: '16px' }}>
                  <button className="add-btn" onClick={() => openRollModal()}>
                    + Add Your First Roll
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'measurements' && activeTab !== 'rolls' && activeTab !== 'skills' && activeTab !== 'worktype' && activeTab !== 'staff' && (
          <div className="content-section">
            <h2 className="section-title">{tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <p style={{ color: '#6b7280' }}>Content for {tabs.find(tab => tab.id === activeTab)?.label} will be implemented here.</p>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Skills <span className='fields-tag'>{skills.length > 0 && skills.length <= 10 ? '0'+ skills.length : skills.length} Skills</span></h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="add-btn" onClick={fetchSkills}><FiRefreshCw /> Refresh</button>
                <button className="add-btn" onClick={() => openSkillModal()}>Add New Skill</button>
              </div>
            </div>
            
            {skillsError && (
              <div style={{ 
                color: 'var(--alert-color)', 
                background: 'rgba(255, 0, 0, 0.1)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '16px',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}>
                {skillsError}
              </div>
            )}
            
            {skillsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                Loading skills...
              </div>
            ) : skills.length > 0 ? (
              <div className="skills-list">
                {skills.map((skill, index) => (
                  <div key={skill._id || index} className="roll-item">
                    <div className="roll-info">
                        <div className="roll-name">{skill}</div>
                    </div>
                    <div className="roll-actions">
                      <button 
                        className="delete-btn skills-delete"
                        onClick={() => saveSkill({ name: skill, type: 'Remove' })}
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                No skills found
                <div style={{ marginTop: '16px' }}>
                  <button className="add-btn" onClick={() => openSkillModal()}>
                    + Add Your First Skill
                  </button>
                </div>
              </div>
            )}
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

        {/* Skill Modal */}
        <SkillModal
          isOpen={isSkillModalOpen}
          onClose={closeSkillModal}
          onSave={saveSkill}
          editingSkill={editingSkill}
        />
      </div>
    </div>
  );
};

export default Settings;
