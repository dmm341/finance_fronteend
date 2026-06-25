import React, { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory, getUsers } from '../services/api';
import './Categories.css';

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('IN');
  const [user_id, setUserId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, usersRes] = await Promise.all([getCategories(), getUsers()]);
      setCategories(categoriesRes.data);
      setUsers(usersRes.data);
      if (usersRes.data.length > 0) setUserId(usersRes.data[0].id);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name || !user_id) return;

    try {
      if (editingId) {
        await updateCategory(editingId, name, type);
        setEditingId(null);
      } else {
        await addCategory(name, type, Number(user_id));
      }
      setName('');
      await fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setName(category.name);
    setType(category.type);
    setEditingId(category.id);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setType('IN');
    setEditingId(null);
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <form onSubmit={handleAddCategory} className="category-form">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="IN">Income</option>
          <option value="OUT">Expense</option>
        </select>
        <select value={user_id} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update Category' : 'Add Category'}</button>
        {editingId && <button type="button" onClick={handleCancel}>Cancel</button>}
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.type}</td>
                <td>{category.user_id}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditCategory(category)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
