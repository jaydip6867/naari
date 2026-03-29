import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSubcategoryModal from './CreateSubcategoryModal.js';
import RollModal from './RollModal.js';
import SkillModal from './SkillModal.js';
import WorkTypeModal from './WorkTypeModal.js';
import StaffModal from './StaffModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { userRoleAPI, skillsAPI, workTypeAPI, measurementsAPI, staffAPI } from '../services/api';
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { RxDragHandleDots2 } from 'react-icons/rx';

const Settings = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('measurements');
  const [visitedTabs, setVisitedTabs] = useState(new Set(['measurements'])); // Track which tabs have been visited
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [newOutfitType, setNewOutfitType] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('cm');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);
  const [workTypesLoading, setWorkTypesLoading] = useState(false);
  const [workTypesError, setWorkTypesError] = useState('');
  const [isWorkTypeModalOpen, setIsWorkTypeModalOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState(null);

  // Outfit Types API function - defined before useEffect to avoid hoisting issues
  const fetchOutfitTypes = useCallback(async () => {
    try {
      setOutfitTypesLoading(true);
      setOutfitTypesError('');
      const outfitTypesData = await measurementsAPI.getOutfitTypes();
      setOutfitTypes(outfitTypesData || []);

      // Set selected outfit to first available outfit if none selected
      if (outfitTypesData && outfitTypesData.length > 0 && !selectedOutfit) {
        const firstOutfit = outfitTypesData[0];
        setSelectedOutfit(firstOutfit.name);

        // Auto-select first subcategory if available
        if (firstOutfit.hasSubCategories && firstOutfit.subCategories && firstOutfit.subCategories.length > 0) {
          setSelectedSubcategory(firstOutfit.subCategories[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching outfit types:', err);
      setOutfitTypesError(err.message || 'Failed to fetch outfit types');
    } finally {
      setOutfitTypesLoading(false);
    }
  }, [selectedOutfit]);

  // Fetch data only when a tab becomes active for the first time
  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return; // Don't do anything if clicking the same tab
    
    setActiveTab(tabId);
    
    // Only fetch data if this tab hasn't been visited before
    if (!visitedTabs.has(tabId)) {
      setVisitedTabs(prev => new Set(prev).add(tabId));
      
      // Fetch data based on the tab
      switch (tabId) {
        case 'measurements':
          fetchOutfitTypes();
          break;
        case 'rolls':
          fetchUserRoles();
          break;
        case 'skills':
          fetchSkills();
          break;
        case 'worktype':
          fetchWorkTypes();
          break;
        case 'staff':
          fetchStaff();
          fetchRoles();
          break;
        default:
          break;
      }
    }
  };

  // Initial fetch only for the default active tab (measurements)
  useEffect(() => {
    fetchOutfitTypes();
  }, [fetchOutfitTypes]);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const roles = await userRoleAPI.listRoles('');
      setUserRoles(roles || []);
      // console.log('User roles fetched:', roles);
    } catch (err) {
      console.error('Error fetching user roles:', err);
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
      // console.log('Skill saved:', savedSkill);

      // Refresh the skills list
      await fetchSkills();

      return savedSkill;
    } catch (err) {
      console.error('Error saving skill:', err);
      throw err;
    }
  };

  // WorkType Modal functions
  const fetchWorkTypes = async () => {
    try {
      setWorkTypesLoading(true);
      setWorkTypesError('');
      const workTypesData = await workTypeAPI.getWorkTypes();
      setWorkTypes(workTypesData || []);
    } catch (err) {
      console.error('Error fetching work types:', err);
      setWorkTypesError(err.message || 'Failed to fetch work types');
    } finally {
      setWorkTypesLoading(false);
    }
  };

  const openWorkTypeModal = (workType = null) => {
    setEditingWorkType(workType);
    setIsWorkTypeModalOpen(true);
  };

  const closeWorkTypeModal = () => {
    setIsWorkTypeModalOpen(false);
    setEditingWorkType(null);
  };

  const saveWorkType = async (workTypeData) => {
    try {
      const savedWorkType = await workTypeAPI.saveWorkType(workTypeData);
      // console.log('Work type saved:', savedWorkType);

      // Refresh the work types list
      await fetchWorkTypes();

      return savedWorkType;
    } catch (err) {
      console.error('Error saving work type:', err);
      throw err;
    }
  };

  // Measurements API functions
  // Staff API functions
  const fetchRoles = async () => {
    try {
      const roles = await userRoleAPI.listRoles();
      // console.log('Roles fetched:', roles);
      return roles;
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  };

  const fetchStaff = async () => {
    try {
      setStaffLoading(true);
      setStaffError('');
      const staffData = await staffAPI.getStaffList();
      
      // Handle different API response structures
      let staffList = [];
      if (Array.isArray(staffData)) {
        staffList = staffData;
      } else if (staffData && Array.isArray(staffData.data)) {
        staffList = staffData.data;
      } else if (staffData && Array.isArray(staffData.staffList)) {
        staffList = staffData.staffList;
      } else if (staffData && typeof staffData === 'object') {
        // Try to find array in the response object
        staffList = Object.values(staffData).find(Array.isArray) || [];
      }
      
      // console.log('Staff data received:', staffData);
      // console.log('Staff list extracted:', staffList);
      
      setStaff(staffList);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffError(err.message || 'Failed to fetch staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const saveStaff = async (staffData) => {
    try {
      // console.log('Settings - Received staff data:', staffData);
      // console.log('Settings - staffId in received data:', staffData.staffId);
      
      const savedStaff = await staffAPI.saveStaff(staffData);
      // console.log('Staff saved:', savedStaff);
      
      // Refresh the staff list
      await fetchStaff();
      
      return savedStaff;
    } catch (err) {
      console.error('Error saving staff:', err);
      throw err;
    }
  };

  const deleteStaff = async (staffId) => {
    try {
      // console.log('Settings - Deleting staff with ID:', staffId);
      
      const deletedStaff = await staffAPI.deleteStaff(staffId);
      // console.log('Staff deleted:', deletedStaff);
      
      // Refresh the staff list
      await fetchStaff();
      
      return deletedStaff;
    } catch (err) {
      console.error('Error deleting staff:', err);
      throw err;
    }
  };

  // Staff modal functions
  const openStaffModal = () => {
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (staffMember) => {
    setEditingStaff(staffMember);
    setIsStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const addOutfitTypeAPI = async () => {
    if (!newOutfitType.trim()) return;

    try {
      await measurementsAPI.saveOutfitType({ name: newOutfitType.trim() });
      setNewOutfitType('');
      await fetchOutfitTypes();
    } catch (err) {
      console.error('Error adding outfit type:', err);
      setOutfitTypesError(err.message || 'Failed to add outfit type');
    }
  };

  const deleteOutfitTypeAPI = async (outfitTypeId) => {
    try {
      await measurementsAPI.deleteOutfitType(outfitTypeId);
      await fetchOutfitTypes();
    } catch (err) {
      console.error('Error deleting outfit type:', err);
      setOutfitTypesError(err.message || 'Failed to delete outfit type');
    }
  };

  // Helper functions to get current outfit and subcategory data
  const getCurrentOutfit = () => {
    return outfitTypes.find(outfit => outfit.name === selectedOutfit);
  };

  const getCurrentSubcategory = () => {
    const currentOutfit = getCurrentOutfit();
    if (currentOutfit && currentOutfit.hasSubCategories && currentOutfit.subCategories) {
      return currentOutfit.subCategories.find(sub => sub.name === selectedSubcategory);
    }
    return null;
  };

  const getCurrentFields = () => {
    const currentSubcategory = getCurrentSubcategory();
    if (currentSubcategory && currentSubcategory.fields) {
      return currentSubcategory.fields.map((field, index) => ({
        id: index + 1,
        name: field.label,
        unit: field.unit,
        required: field.isRequired
      }));
    }

    // If no subcategory selected, check for direct fields
    const currentOutfit = getCurrentOutfit();
    if (currentOutfit && currentOutfit.fields && !currentOutfit.hasSubCategories) {
      return currentOutfit.fields.map((field, index) => ({
        id: index + 1,
        name: field.label,
        unit: field.unit,
        required: field.isRequired
      }));
    }

    return [];
  };

  const handleOutfitSelect = (outfitName) => {
    setSelectedOutfit(outfitName);
    const outfit = outfitTypes.find(o => o.name === outfitName);

    // Reset subcategory selection and auto-select first if available
    if (outfit && outfit.hasSubCategories && outfit.subCategories && outfit.subCategories.length > 0) {
      setSelectedSubcategory(outfit.subCategories[0].name);
    } else {
      setSelectedSubcategory('');
    }
  };

  const handleSubcategorySelect = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName);
  };

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [draggedRollIndex, setDraggedRollIndex] = useState(null);
  // const [draggedFieldIndex, setDraggedFieldIndex] = useState(null);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState('');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [outfitTypes, setOutfitTypes] = useState([]);
  const [outfitTypesLoading, setOutfitTypesLoading] = useState(false);
  const [outfitTypesError, setOutfitTypesError] = useState('');

  // Separate state for measurement tab field items (for drag functionality)
  const [fieldItems, setFieldItems] = useState([]);

  // Sync fieldItems with current fields when outfit/subcategory changes
  // Note: outfitTypes is included so fieldItems updates after add/delete operations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'measurements') {
      const currentFields = getCurrentFields();
      setFieldItems(currentFields);
    }
  }, [selectedOutfit, selectedSubcategory, outfitTypes, activeTab]);

  // Staff state
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const tabs = [
    { id: 'measurements', label: 'Measurements' },
    { id: 'rolls', label: 'Rolls' },
    { id: 'skills', label: 'Skills' },
    { id: 'worktype', label: 'Work Type' },
    { id: 'staff', label: 'Staff Account' }
  ];


  const addMeasurementField = async () => {
    if (!newFieldName.trim()) {
      return;
    }

    try {
      // For outfits with subcategories, add field to selected subcategory
      if (selectedSubcategory) {
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && currentOutfit.hasSubCategories && currentOutfit.subCategories) {
          const newField = {
            label: newFieldName.trim(),
            unit: newFieldUnit,
            isRequired: newFieldRequired
          };

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: true,
            subCategories: currentOutfit.subCategories.map(sub => {
              if (sub.name === selectedSubcategory) {
                return {
                  name: sub.name,
                  fields: [...(sub.fields || []), newField]
                };
              }
              return sub;
            })
          };

          // Call API to save field
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      } else {
        // For outfits without subcategories, add field directly
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && !currentOutfit.hasSubCategories) {
          const newField = {
            label: newFieldName.trim(),
            unit: newFieldUnit,
            isRequired: newFieldRequired
          };

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: false,
            fields: [...(currentOutfit.fields || []), newField]
          };

          // Call API to save field
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      }

      // Reset form
      setNewFieldName('');
      setNewFieldRequired(false);
    } catch (err) {
      console.error('Error adding measurement field:', err);
      setOutfitTypesError(err.message || 'Failed to add field');
    }
  };

  const deleteMeasurementField = async (id) => {
    try {
      // For outfits with subcategories, delete field from selected subcategory
      if (selectedSubcategory) {
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && currentOutfit.hasSubCategories && currentOutfit.subCategories) {
          const updatedSubcategories = currentOutfit.subCategories.map(sub => {
            if (sub.name === selectedSubcategory) {
              const updatedFields = sub.fields.filter((field, index) => index + 1 !== id);
              return {
                ...sub,
                fields: updatedFields
              };
            }
            return sub;
          });

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: true,
            subCategories: updatedSubcategories
          };

          // Call API to save updated field structure
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      } else {
        // For outfits without subcategories, delete field directly
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && !currentOutfit.hasSubCategories) {
          const updatedFields = currentOutfit.fields.filter((field, index) => index + 1 !== id);

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: false,
            fields: updatedFields
          };

          // Call API to save updated field structure
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      }
    } catch (err) {
      console.error('Error deleting measurement field:', err);
      setOutfitTypesError(err.message || 'Failed to delete field');
    }
  };

  const toggleFieldRequired = async (id) => {
    try {
      // For outfits with subcategories, toggle field in selected subcategory
      if (selectedSubcategory) {
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && currentOutfit.hasSubCategories && currentOutfit.subCategories) {
          const updatedSubcategories = currentOutfit.subCategories.map(sub => {
            if (sub.name === selectedSubcategory) {
              const updatedFields = sub.fields.map((field, index) => {
                if (index + 1 === id) {
                  return {
                    ...field,
                    isRequired: !field.isRequired
                  };
                }
                return field;
              });
              return {
                ...sub,
                fields: updatedFields
              };
            }
            return sub;
          });

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: true,
            subCategories: updatedSubcategories
          };

          // Call API to save updated field structure
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      } else {
        // For outfits without subcategories, toggle field directly
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && !currentOutfit.hasSubCategories) {
          const updatedFields = currentOutfit.fields.map((field, index) => {
            if (index + 1 === id) {
              return {
                ...field,
                isRequired: !field.isRequired
              };
            }
            return field;
          });

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: false,
            fields: updatedFields
          };

          // Call API to save updated field structure
          await measurementsAPI.saveOutfitTypeField(fieldData);

          // Refresh data from API
          await fetchOutfitTypes();
        }
      }
    } catch (err) {
      console.error('Error toggling field required:', err);
      setOutfitTypesError(err.message || 'Failed to update field');
    }
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

  const deleteSubcategory = async (outfitName, subcategoryIndex) => {
    try {
      const outfit = outfitTypes.find(o => o.name === outfitName);
      if (outfit && outfit.subCategories && outfit.subCategories[subcategoryIndex]) {
        const subcategoryToDelete = outfit.subCategories[subcategoryIndex].name;
        
        // Call API to delete subcategory
        await measurementsAPI.deleteSubcategory(outfit._id, subcategoryToDelete);
        
        // Refresh data from API
        await fetchOutfitTypes();
        
        // If the deleted subcategory was selected, clear selection
        if (selectedSubcategory === subcategoryToDelete) {
          setSelectedSubcategory(null);
        }
      }
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      setOutfitTypesError(err.message || 'Failed to delete subcategory');
    }
  };

  const saveSubcategory = async (subcategoryName, outfitTypeId) => {
    try {
      // Use passed outfitTypeId or fall back to current outfit
      const currentOutfit = outfitTypeId 
        ? outfitTypes.find(o => o._id === outfitTypeId)
        : getCurrentOutfit();
        
      if (!currentOutfit) {
        console.error('No outfit selected');
        return;
      }

      // Prepare subcategories array with the new one added
      const updatedSubCategories = [
        ...(currentOutfit.subCategories || []),
        { name: subcategoryName, fields: [] }
      ];

      // Save to API
      await measurementsAPI.saveOutfitTypeField({
        outfitTypeId: currentOutfit._id,
        hasSubCategories: true,
        subCategories: updatedSubCategories
      });

      // Refresh data from API
      await fetchOutfitTypes();

      // Auto-select the newly created subcategory
      setSelectedSubcategory(subcategoryName);

      console.log('Subcategory saved:', subcategoryName, 'to', selectedOutfit);
    } catch (err) {
      console.error('Error saving subcategory:', err);
      setOutfitTypesError(err.message || 'Failed to save subcategory');
    }
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
      // console.log('Roll saved:', savedRoll);

      // Refresh the roles list
      await fetchUserRoles();

      closeRollModal();
      return savedRoll;
    } catch (err) {
      console.error('Error saving roll:', err);
      throw err;
    }
  };

  const handleFieldUnitChange = async (fieldId, newUnit) => {
    try {
      // Update the field unit in the correct subcategory
      if (selectedSubcategory) {
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && currentOutfit.hasSubCategories && currentOutfit.subCategories) {
          const updatedSubcategories = currentOutfit.subCategories.map(sub => {
            if (sub.name === selectedSubcategory) {
              const updatedFields = sub.fields.map((field, index) => {
                if (index + 1 === fieldId) {
                  return {
                    ...field,
                    unit: newUnit
                  };
                }
                return field;
              });
              return {
                ...sub,
                fields: updatedFields
              };
            }
            return sub;
          });

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: true,
            subCategories: updatedSubcategories
          };

          // Call API to save updated field unit
          await measurementsAPI.saveOutfitTypeField(fieldData);
          
          // Refresh data from API
          await fetchOutfitTypes();
        }
      } else {
        // For outfits without subcategories, update directly
        const currentOutfit = getCurrentOutfit();
        if (currentOutfit && !currentOutfit.hasSubCategories) {
          const updatedFields = currentOutfit.fields.map((field, index) => {
            if (index + 1 === fieldId) {
              return {
                ...field,
                unit: newUnit
              };
            }
            return field;
          });

          // Prepare API payload
          const fieldData = {
            outfitTypeId: currentOutfit._id,
            hasSubCategories: false,
            fields: updatedFields
          };

          // Call API to save updated field unit
          await measurementsAPI.saveOutfitTypeField(fieldData);
          
          // Refresh data from API
          await fetchOutfitTypes();
        }
      }
    } catch (err) {
      console.error('Error updating field unit:', err);
      setOutfitTypesError(err.message || 'Failed to update field unit');
    }
  };

  // const handleDragEnd = (e) => {
  //   // Only remove dragging class from field items
  //   if (draggedItemType === 'measurementField' && e.currentTarget) {
  //     e.currentTarget.classList.remove('dragging');
  //   }
  //   setDraggedItem(null);
  //   setDraggedItemType(null);
  // };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = 'move';
  // };

  const handleDrop = async (e, targetItem, targetType, targetIndex = null) => {
    e.preventDefault();

    if (draggedItem && draggedItemType === 'measurementField' && targetType === 'measurementField') {
      const draggedIndex = fieldItems.findIndex(field => field.id === draggedItem.id);
      const targetIdx = targetIndex !== null ? targetIndex : fieldItems.findIndex(field => field.id === targetItem.id);

      if (draggedIndex !== -1 && targetIdx !== -1 && draggedIndex !== targetIdx) {
        // Reorder fieldItems state for immediate UI feedback
        const newFields = [...fieldItems];
        const [removed] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIdx, 0, removed);
        setFieldItems(newFields);

        // Convert back to API format and persist
        const apiFields = newFields.map(field => ({
          label: field.name,
          unit: field.unit,
          isRequired: field.required
        }));

        try {
          const currentOutfit = getCurrentOutfit();
          if (!currentOutfit) return;

          if (selectedSubcategory) {
            // Update subcategory fields
            if (currentOutfit.hasSubCategories && currentOutfit.subCategories) {
              const updatedSubcategories = currentOutfit.subCategories.map(sub => {
                if (sub.name === selectedSubcategory) {
                  return { ...sub, fields: apiFields };
                }
                return sub;
              });

              await measurementsAPI.saveOutfitTypeField({
                outfitTypeId: currentOutfit._id,
                hasSubCategories: true,
                subCategories: updatedSubcategories
              });
            }
          } else {
            // Update outfit-level fields
            if (!currentOutfit.hasSubCategories) {
              await measurementsAPI.saveOutfitTypeField({
                outfitTypeId: currentOutfit._id,
                hasSubCategories: false,
                fields: apiFields
              });
            }
          }
          // Note: No fetchOutfitTypes() call here to prevent unnecessary API calls during drag
        } catch (err) {
          console.error('Error saving reordered fields:', err);
          setFieldItems(getCurrentFields());
        }
      }
    } else if (draggedItemType === 'roll' && targetType === 'roll' && targetIndex !== null) {
      const newRolls = [...userRoles];
      const draggedIdx = draggedRollIndex;

      if (draggedIdx !== null && draggedIdx !== targetIndex) {
        const [removed] = newRolls.splice(draggedIdx, 1);
        newRolls.splice(targetIndex, 0, removed);
        setUserRoles(newRolls);
      }
    }

    setDraggedItem(null);
    setDraggedItemType(null);
    setDraggedRollIndex(null);
  };

  // Remove field-specific drag handlers (no longer needed)
  // const handleFieldDragStart = (e, field, index) => {
  //   setDraggedItem(field);
  //   setDraggedItemType('measurementField');
  //   setDraggedFieldIndex(index);
  //   e.dataTransfer.effectAllowed = 'move';
  //   e.target.style.opacity = '0.5';
  // };

  // const handleFieldDragEnd = (e) => {
  //   e.target.style.opacity = '';
  //   setDraggedItem(null);
  //   setDraggedItemType(null);
  //   setDraggedFieldIndex(null);
  // };

  // const handleFieldDragOver = (e) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = 'move';
  // };

  // Field-specific drag handlers
  const handleFieldDragStart = (e, field, index) => {
    setDraggedItem(field);
    setDraggedItemType('measurementField');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(field));
  };

  const handleFieldDragEnd = (e) => {
    setDraggedItem(null);
    setDraggedItemType(null);
  };

  const handleFieldDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
              onClick={() => handleTabChange(tab.id)}
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
                {/* <button className="add-btn" onClick={fetchOutfitTypes}><FiRefreshCw /></button> */}
              </div>

              {outfitTypesError && (
                <div style={{
                  color: 'var(--alert-color)',
                  background: 'rgba(255, 0, 0, 0.1)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 0, 0, 0.2)'
                }}>
                  {outfitTypesError}
                </div>
              )}

              {outfitTypesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                  Loading outfit types...
                </div>
              ) : (
                <>
                  <div className="add-field-container">
                    <input
                      type="text"
                      className="input-field measurements_input"
                      placeholder="Enter to add outfit type"
                      value={newOutfitType}
                      onChange={(e) => setNewOutfitType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addOutfitTypeAPI()}
                    />
                    <button className="add-btn measurements_add_btn" onClick={addOutfitTypeAPI}>
                      Add
                    </button>
                  </div>

                  <div className="outfit-list">
                    {outfitTypes.map(outfit => (
                      <React.Fragment key={outfit._id || outfit.id}>
                        <div
                          className={`outfit-item ${selectedOutfit === outfit.name ? 'selected' : ''}`}
                          onClick={() => handleOutfitSelect(outfit.name)}
                        >
                          <span className="outfit-name">{outfit.name}</span>
                          <div className="outfit-content">
                            <span className="outfit-fields-tag">
                              {outfit.hasSubCategories && outfit.subCategories
                                ? `${outfit.subCategories.length} Subcategories`
                                : `${(outfit.fields?.length || 0)} Fields`
                              }
                            </span>
                            <FiTrash2 className='delete-icon' onClick={(e) => {
                              e.stopPropagation();
                              deleteOutfitTypeAPI(outfit._id || outfit.id);
                            }} />
                          </div>
                        </div>

                        {/* Display subcategories below each outfit */}
                        {outfit.hasSubCategories && outfit.subCategories && outfit.subCategories.length > 0 && (
                          <div className="subcategories-list">
                            {outfit.subCategories.map((subcategory, index) => (
                              <div
                                key={index}
                                className={`subcategory-item ${selectedOutfit === outfit.name && selectedSubcategory === subcategory.name ? 'selected' : ''}`}
                                onClick={() => handleSubcategorySelect(subcategory.name)}
                              >
                                <span className="subcategory-name">{subcategory.name}</span>
                                <div className="subcategory-content">
                                  <span className="subcategory-fields-tag">{(subcategory.fields?.length || 0).toString().padStart(2, '0')} Fields</span>
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
                </>
              )}
            </div>

            {/* Measurement Fields Section */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  {selectedOutfit}
                  {selectedSubcategory && ` - ${selectedSubcategory}`}
                  <span className='fields-tag'>{fieldItems.length.toString().padStart(2, '0')} Fields</span>
                </h2>
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
                  {fieldItems.map((field, index) => (
                    <div
                      key={field.id}
                      className={`field-item draggable-item ${draggedItem?.id === field.id && draggedItemType === 'measurementField' ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleFieldDragStart(e, field, index)}
                      onDragEnd={handleFieldDragEnd}
                      onDragOver={handleFieldDragOver}
                      onDrop={(e) => handleDrop(e, field, 'measurementField', index)}
                    >
                      <RxDragHandleDots2 className="drag-handle" />
                      <div className="field-name">{field.name}</div>
                      <select className="dropdown" value={field.unit} onChange={(e) => handleFieldUnitChange(field.id, e.target.value)}>
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
                {/* <button className="add-btn" onClick={fetchUserRoles}><FiRefreshCw /> Refresh</button> */}
                <button className="add-btn" onClick={() => openRollModal()}>+ Add New Roll</button>
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

        {/* Staff Account Tab */}
        {activeTab === 'staff' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Staff Account</h2>
              <div style={{display:'flex' , gap: '12px'}}>
                {/* <button className="add-btn" onClick={fetchStaff}><FiRefreshCw /> Refresh</button> */}
                <button className="add-btn" onClick={openStaffModal}>+ Add Staff</button>
              </div>
            </div>

            {staffError && (
              <div style={{
                color: 'var(--alert-color)',
                background: 'rgba(255, 0, 0, 0.1)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}>
                {staffError}
              </div>
            )}

            {staffLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                Loading staff...
              </div>
            ) : Array.isArray(staff) && staff.length > 0 ? (
              <div className="roll-list">
                {staff.map((staffMember, index) => (
                  <div key={staffMember._id || index} className="roll-item">
                    <div className="roll-info">
                      <div className="roll-name">{staffMember.name || staffMember.fullName || 'Unknown'}</div>
                      <div className="roll-details">
                        <span className="roll-role theme-color">- {staffMember.roleid?.name || ''}</span>
                      </div>
                    </div>
                    <div className="roll-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => openEditStaffModal(staffMember)}
                        title="Edit Staff"
                      >
                        <FiEdit />
                      </button>
                      <button className="delete-btn skills-delete" onClick={() => deleteStaff(staffMember._id)} title="Delete Staff">
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p>No staff members found.</p>
                  <button className="add-btn" onClick={openStaffModal}>+ Add Your First Staff Member</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Skills <span className='fields-tag'>{skills.length > 0 && skills.length <= 10 ? '0' + skills.length : skills.length} Skills</span></h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* <button className="add-btn" onClick={fetchSkills}><FiRefreshCw /> Refresh</button> */}
                <button className="add-btn" onClick={() => openSkillModal()}>+ Add New Skill</button>
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

        {/* WorkType Tab */}
        {activeTab === 'worktype' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Work Types <span className='fields-tag'>{workTypes.length > 0 && workTypes.length <= 10 ? '0' + workTypes.length : workTypes.length} Work Types</span></h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* <button className="add-btn" onClick={fetchWorkTypes}><FiRefreshCw /> Refresh</button> */}
                <button className="add-btn" onClick={() => openWorkTypeModal()}>+ Add New Work Type</button>
              </div>
            </div>

            {workTypesError && (
              <div style={{
                color: 'var(--alert-color)',
                background: 'rgba(255, 0, 0, 0.1)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}>
                {workTypesError}
              </div>
            )}

            {workTypesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                Loading work types...
              </div>
            ) : workTypes.length > 0 ? (
              <div className="skills-list">
                {workTypes.map((workType, index) => (
                  <div key={workType._id || index} className="roll-item">
                    <div className="roll-info">
                      <div className="roll-name">{workType}</div>
                    </div>
                    <div className="roll-actions">
                      <button
                        className="delete-btn skills-delete"
                        onClick={() => saveWorkType({ name: workType, type: 'Remove' })}
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                No work types found
                <div style={{ marginTop: '16px' }}>
                  <button className="add-btn" onClick={() => openWorkTypeModal()}>
                    + Add Your First Work Type
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
          outfitTypeId={getCurrentOutfit()?._id}
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

        {/* WorkType Modal */}
        <WorkTypeModal
          isOpen={isWorkTypeModalOpen}
          onClose={closeWorkTypeModal}
          onSave={saveWorkType}
          editingWorkType={editingWorkType}
        />
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={closeStaffModal}
        onSave={saveStaff}
        editingStaff={editingStaff}
        userRoles={userRoles}
      />
    </div>
  );
};

export default Settings;
