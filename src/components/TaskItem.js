import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleTask, deleteTask } from '../store/slices/tasksSlice';
import './TaskItem.css';

const TaskItem = ({ task, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();

  const handleToggle = async () => {
    try {
      await dispatch(toggleTask(task._id)).unwrap();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await dispatch(deleteTask(task._id)).unwrap();
      } catch (error) {
        console.error('Error deleting task:', error);
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-actions">
            <button
              onClick={() => onEdit(task)}
              className="btn btn-edit"
              title="Edit task"
              type="button"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-delete"
              title="Delete task"
              disabled={isDeleting}
              type="button"
            >
              {isDeleting ? '⏳' : '🗑️'}
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-footer">
          <span className="task-date">
            Created: {formatDate(task.createdAt)}
          </span>
          {task.updatedAt !== task.createdAt && (
            <span className="task-date">
              Updated: {formatDate(task.updatedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="task-toggle">
        <button
          onClick={handleToggle}
          className={`toggle-btn ${task.completed ? 'completed' : ''}`}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          type="button"
        >
          {task.completed ? '✓' : '○'}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;