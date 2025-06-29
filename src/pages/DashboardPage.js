import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';


function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'low',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [shareEmail, setShareEmail] = useState('');
  const [shareTargetTaskId, setShareTargetTaskId] = useState(null);

  const [socket, setSocket] = useState(null);

    // Connect on mount
    useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    if (userId) newSocket.emit('join', userId);

    return () => newSocket.disconnect();
    }, []);
      
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const shareTask = async (taskId) => {
    try {
      await axios.post(`http://localhost:5000/api/tasks/share/${taskId}`, { email: shareEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Task shared successfully');
      setShareEmail('');
      setShareTargetTaskId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to share task');
    }
  };
  

  // ✅ FIX: Define fetchTasks using useCallback so it's available for useEffect
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks || res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);
  useEffect(() => {
    if (!socket) return;
  
    socket.on('taskCreated', fetchTasks);
    socket.on('taskUpdated', fetchTasks);
    socket.on('taskDeleted', fetchTasks);
  
    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [socket, fetchTasks]);

  const createOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTaskId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/tasks', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ title: '', description: '', dueDate: '', priority: 'low' });
      setEditingTaskId(null);
      await fetchTasks(); // ✅ FIX: now fetchTasks is defined
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate?.slice(0, 10),
      priority: task.priority,
    });
    setEditingTaskId(task._id);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks(); // ✅ FIX: now fetchTasks is defined
    } catch (err) {
      console.error(err);
    }
  };
  const toggleComplete = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { completed: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    if (token) fetchTasks(); // ✅ FIX: useEffect now works correctly
  }, [token, fetchTasks]);

  return (
    <div className="container mt-4">
      <h2>Welcome {user?.name} 🎯</h2>

      <form onSubmit={createOrUpdateTask} className="mb-4 mt-3 border p-3 rounded bg-light">
        <h5>{editingTaskId ? 'Edit Task' : 'Create Task'}</h5>
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <input
            type="date"
            className="form-control"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <select
            className="form-select"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success w-100">
          {editingTaskId ? 'Update Task' : 'Add Task'}
        </button>
      </form>

      <div className="mb-3">
        <label>Filter by Priority:</label>
        <select
            className="form-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
        >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>
       </div>


      <h5>Your Tasks</h5>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="list-group">
          {tasks
          .filter(task => filterPriority === 'all' || task.priority === filterPriority)
          .map((task) => (
            <li key={task._id} className="list-group-item">
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-start">
                <input
                type="checkbox"
                className="form-check-input me-2 mt-1"
                checked={task.completed}
                onChange={() => toggleComplete(task._id, !task.completed)}
                />
                <div>
                <strong>{task.title}</strong> - {task.priority.toUpperCase()}
                <br />
                <small>{task.description}</small>
                <br />
                <small className="text-muted">Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                </div>
            </div>
            <div className="text-end">
            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(task)}>
                Edit
            </button>
            <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(task._id)}>
                Delete
            </button>
            <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShareTargetTaskId(shareTargetTaskId === task._id ? null : task._id)}
            >
                {shareTargetTaskId === task._id ? 'Cancel' : 'Share'}
            </button>
            </div>
        </div>

        {shareTargetTaskId === task._id && (
            <div className="mt-2 d-flex">
            <input
                type="email"
                className="form-control me-2"
                placeholder="Enter email to share"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
            />
            <button className="btn btn-success" onClick={() => shareTask(task._id)}>
                Send
            </button>
            </div>
        )}
        </li>

          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
