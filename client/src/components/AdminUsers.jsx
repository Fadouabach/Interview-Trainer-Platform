import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, Edit } from 'lucide-react';

export function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const res = await axios.get('http://localhost:5002/api/admin/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('auth-token');
            await axios.delete(`http://localhost:5002/api/admin/users/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(users.filter(u => (u._id || u.id) !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete user");
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.put(`http://localhost:5002/api/admin/users/${id}/role`, { role: newRole }, {
                headers: { 'x-auth-token': token }
            });
            setUsers(users.map(u => (u._id || u.id) === id ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error("Role update failed", err);
            alert("Failed to update role");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2rem' }}>Loading Users...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View, search, and edit platform users.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', 
                            border: '1px solid var(--border-subtle)', outline: 'none'
                        }}
                    />
                </div>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Joined</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u, i) => (
                            <tr key={(u._id || u.id || i)} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '1rem' }}>{u.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select 
                                        value={u.role || 'user'} 
                                        onChange={(e) => handleRoleUpdate(u._id || u.id, e.target.value)}
                                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                                    >
                                        <option value="user">User</option>
                                        <option value="expert">Expert</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(u._id || u.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
