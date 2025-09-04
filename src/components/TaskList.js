import React from 'react';
import { useSelector } from 'react-redux';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ onEditTask }) => {
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  if (loading) {
    return (
      <div className="task-list">
        <div className="loading">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list">
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks yet</h3>
          <p>Add your first task to get started!</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="task-list">
      {pendingTasks.length > 0 && (
        <div className="task-section">
          <h2 className="section-title">
            Pending Tasks ({pendingTasks.length})
          </h2>
          {pendingTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={onEditTask}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section">
          <h2 className="section-title">
            Completed Tasks ({completedTasks.length})
          </h2>
          {completedTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={onEditTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;