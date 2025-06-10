import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaRedo } from 'react-icons/fa';
import {
    getAllUsers,
    createUserAdmin,
    updateUserAdmin,
    deleteUserAdmin,
    getTotalUsersCount
} from '../../../services/userService';
import UsersTable from '../users/UsersTable';
import UserModal from '../users/UserModal';
import SectionCard from '../layout/SectionCard';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const UsersManagementSection = ({ showMessage, contextUsuario, navigate }) => {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [totalUsersCount, setTotalUsersCount] = useState(0);

    const [searchTermUserName, setSearchTermUserName] = useState('');
    const [searchTermUserLastname, setSearchTermUserLastname] = useState('');
    const [searchTermUserEmail, setSearchTermUserEmail] = useState('');

    const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

    const debounceTimeoutUserSearchRef = useRef(null);

    const fetchUsers = useCallback(async (page, limit, name, lastname, email, rol) => {
        setLoadingUsers(true);
        setErrorUsers(null);
        try {
            const offset = (page - 1) * limit;

            const response = await getAllUsers(limit, offset, name, lastname, email, rol);
            if (response && response.usuarios) {
                setUsers(response.usuarios);
            } else {
                setUsers([]);
            }
        } catch (err) {
            showMessage({ message: err.message || 'Error al cargar los usuarios. Por favor, intente de nuevo.', type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [showMessage, navigate]);

    const fetchTotalUsers = useCallback(async (name, lastname, email, rol) => {
        try {
            const response = await getTotalUsersCount(name, lastname, email, rol);
            if (response && typeof response.total_users === 'number') {
                setTotalUsersCount(response.total_users);
            } else {
                setTotalUsersCount(0);
            }
        } catch (err) {
            console.error('Error al obtener el conteo total de usuarios:', err);
            setTotalUsersCount(0);
        }
    }, []);

    useEffect(() => {
        if (contextUsuario) {
        }
    }, [contextUsuario]);

    useEffect(() => {
        if (debounceTimeoutUserSearchRef.current) {
            clearTimeout(debounceTimeoutUserSearchRef.current);
        }

        debounceTimeoutUserSearchRef.current = setTimeout(() => {
            fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
            fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
        }, 500);

        return () => {
            if (debounceTimeoutUserSearchRef.current) {
                clearTimeout(debounceTimeoutUserSearchRef.current);
            }
        };
    }, [
        currentPage, 
        searchTermUserName,
        searchTermUserLastname,
        searchTermUserEmail,
        selectedRoleFilter,
        fetchUsers,
        fetchTotalUsers,
        usersPerPage
    ]);


    const handleNewUserClick = () => {
        setEditingUser(null);
        setShowUserModal(true);
    };

    const handleEditUserClick = (user) => {
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (editingUser) {
                await updateUserAdmin(editingUser.id, userData);
                showMessage({ message: `El usuario "${userData.name} ${userData.lastname}" se actualizó correctamente.`, type: 'success' });
            } else {
                const response = await createUserAdmin(userData);
                showMessage({ message: `El usuario "${response.name || userData.name}" se creó correctamente.`, type: 'success' });
            }
            setShowUserModal(false);
            setEditingUser(null);
            fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
            fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
        } catch (err) {
            const errorMessage = err.data?.error || err.message || 'Error desconocido al guardar usuario.';
            showMessage({ message: `Error al guardar usuario: ${errorMessage}`, type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        showMessage({
            message: '¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await deleteUserAdmin(userId);
                    showMessage({ message: `El usuario se eliminó correctamente.`, type: 'success' });

                    fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
                    fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail, selectedRoleFilter);
                } catch (err) {
                    const errorMessage = err.data?.error || err.message || 'Error desconocido al eliminar usuario.';
                    showMessage({ message: `Error al eliminar usuario: ${errorMessage}`, type: 'error' });
                    if (err.status === 401) {
                        navigate('/login');
                    }
                }
            }
        });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    const handleSearchOrFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };


    const handleClearUserSearch = () => {
        setSearchTermUserName('');
        setSearchTermUserLastname('');
        setSearchTermUserEmail('');
        setSelectedRoleFilter('');
        setCurrentPage(1);
    };

    return (
        <SectionCard>
            <div className={styles.sectionHeader}>
                <button className={styles.addButton} onClick={handleNewUserClick}>
                    <FaPlus /> Nuevo Usuario
                </button>
            </div>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={searchTermUserName}
                    onChange={(e) => handleSearchOrFilterChange(setSearchTermUserName, e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Buscar por apellido"
                    value={searchTermUserLastname}
                    onChange={(e) => handleSearchOrFilterChange(setSearchTermUserLastname, e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Buscar por email"
                    value={searchTermUserEmail}
                    onChange={(e) => handleSearchOrFilterChange(setSearchTermUserEmail, e.target.value)}
                />
                <select
                    value={selectedRoleFilter}
                    onChange={(e) => handleSearchOrFilterChange(setSelectedRoleFilter, e.target.value)}
                    className={styles.selectFilter}
                >
                    <option value="">Todos los Roles</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="profesor">Profesor</option>
                    <option value="admin">Administrador</option>
                </select>

                <button className={styles.clearSearchButton} onClick={handleClearUserSearch}>
                    <FaRedo /> Limpiar Búsqueda
                </button>
            </div>
            <UsersTable
                users={users}
                loading={loadingUsers}
                error={errorUsers}
                onEdit={handleEditUserClick}
                onDelete={handleDeleteUser}
                currentPage={currentPage}
                itemsPerPage={usersPerPage}
                totalItems={totalUsersCount}
                onPageChange={handlePageChange}
                selectedRoleFilter={selectedRoleFilter}
            />
            {showUserModal && (
                <UserModal
                    editingUser={editingUser}
                    onClose={() => { setShowUserModal(false); setEditingUser(null); }}
                    onSave={handleSaveUser}
                />
            )}
        </SectionCard>
    );
};

export default UsersManagementSection;
