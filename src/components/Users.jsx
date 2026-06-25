import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import './Users.css';

export function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      if (editingId) {
        await updateUser(editingId, name, email);
        setEditingId(null);
      } else {
        await addUser(name, email);
      }
      setName('');
      setEmail('');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    }
  };

  const handleEditUser = (user) => {
    setName(user.name);
    setEmail(user.email);
    setEditingId(user.id);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setEditingId(null);
  };

  return (
    <div className="users-container">
      <h2>Users</h2>
      <form onSubmit={handleAddUser} className="user-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">{editingId ? 'Update User' : 'Add User'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditUser(user)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
