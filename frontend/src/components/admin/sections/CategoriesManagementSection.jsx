import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../../services/categoriasService'; 
import CategoriasTable from '../categorias/CategoriasTable'; 
import CategoriaModal from '../categorias/CategoriaModal'; 
import SectionCard from '../layout/SectionCard'; 
import styles from '../../../routes/admin/AdminDashboard.module.css';

const CategoriesManagementSection = ({ showMessage, contextUsuario, navigate }) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        setErrorCategories(null);
        try {
            const response = await getAllCategorias();
            if (response && response.categorias) {
                setCategories(response.categorias);
            } else {
                setCategories([]);
                console.warn("No se encontraron categorías o el formato de datos es incorrecto:", response);
            }
        } catch (err) {
            showMessage({ message: err.message || 'Error al cargar las categorías. Por favor, intente de nuevo.', type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingCategories(false);
        }
    }, [showMessage, navigate]); 

    
    useEffect(() => {
        if (contextUsuario) { 
            fetchCategories();
        }
    }, [contextUsuario, fetchCategories]); 


    
    const handleNewCategoryClick = () => {
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategoryClick = (category) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (editingCategory) {
                await updateCategoria(editingCategory.id, categoryData);
                showMessage({ message: `La categoría "${categoryData.nombre}" se actualizó correctamente.`, type: 'success' });
            } else {
                const response = await createCategoria(categoryData);
                showMessage({ message: `La categoría "${response.nombre}" se creó correctamente.`, type: 'success' });
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            const errorMessage = err.data?.detalle || err.message || 'Error desconocido al guardar categoría.';
            showMessage({ message: `Error al guardar categoría: ${errorMessage}`, type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        showMessage({
            message: '¿Está seguro de que desea eliminar esta categoría? Esta acción es irreversible.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await deleteCategoria(categoryId);
                    showMessage({ message: `La categoría se eliminó correctamente.`, type: 'success' });
                    fetchCategories();
                } catch (err) {
                    const errorMessage = err.data?.detalle || err.message || 'Error desconocido al eliminar categoría.';
                    showMessage({ message: `Error al eliminar categoría: ${errorMessage}`, type: 'error' });
                    if (err.status === 401) {
                        navigate('/login');
                    }
                }
            }
        });
    };

    return (
        <SectionCard>
            <div className={styles.sectionHeader}>
                <button className={styles.addButton} onClick={handleNewCategoryClick}>
                    <FaPlus /> Nueva Categoría
                </button>
            </div>
            <CategoriasTable
                categories={categories}
                loading={loadingCategories}
                error={errorCategories}
                onEdit={handleEditCategoryClick}
                onDelete={handleDeleteCategory}
            />
            {showCategoryModal && (
                <CategoriaModal
                    editingCategory={editingCategory}
                    onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                    onSave={handleSaveCategory}
                />
            )}
        </SectionCard>
    );
};

export default CategoriesManagementSection;
