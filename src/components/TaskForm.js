import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask, updateTask } from '../store/slices/tasksSlice';
import './TaskForm.css';

const TaskForm = ({ task = null, onCancel }) => {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim()
    };

    try {
      if (task) {
        await dispatch(updateTask({ id: task._id, taskData })).unwrap();
      } else {
        await dispatch(addTask(taskData)).unwrap();
      }

      setTitle('');
      setDescription('');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    if (onCancel) onCancel();
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;