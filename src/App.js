import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, clearError } from './store/slices/tasksSlice';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>K8 Todo App</h1>
          <p>Simple and intuitive task management</p>
        </div>
        <div className="task-stats">
          <div className="stat">
            <span className="stat-number">{pendingTasks.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-number">{completedTasks.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-header">
          <h2>Your Tasks</h2>
          <button
            onClick={handleAddTask}
            className="btn btn-primary add-task-btn"
            disabled={loading}
            type="button"
          >
            + Add New Task
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="close-btn"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <TaskList onEditTask={handleEditTask} />
      </main>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onCancel={handleCloseTaskForm}
        />
      )}
    </div>
  );
}

export default App;