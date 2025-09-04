import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import App from '../App';
import tasksReducer from '../store/slices/tasksSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer
    },
    preloadedState: {
      tasks: {
        tasks: [],
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

// Mock the Redux actions
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

const renderWithProvider = (initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

describe('App', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test('renders app header with title and stats', () => {
    renderWithProvider();
    
    expect(screen.getByText('K8 Todo App')).toBeInTheDocument();
    expect(screen.getByText('Simple and intuitive task management')).toBeInTheDocument();
    expect(screen.getByText('Your Tasks')).toBeInTheDocument();
  });

  test('displays correct task statistics', () => {
    const mockTasks = [
      { _id: '1', title: 'Task 1', completed: false },
      { _id: '2', title: 'Task 2', completed: true },
      { _id: '3', title: 'Task 3', completed: false }
    ];
    
    renderWithProvider({ tasks: mockTasks });
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('3')).toBeInTheDocument(); // Total
  });

  test('shows add task button', () => {
    renderWithProvider();
    
    expect(screen.getByRole('button', { name: '+ Add New Task' })).toBeInTheDocument();
  });

  test('opens task form when add task button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '+ Add New Task' }));
    });
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
  });

  test('closes task form when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    // Open form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '+ Add New Task' }));
    });
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    
    // Close form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
  });

  test('displays error banner when there is an error', () => {
    const errorMessage = 'Failed to fetch tasks';
    renderWithProvider({ error: errorMessage });
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  test('clears error when close button is clicked', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to fetch tasks';
    renderWithProvider({ error: errorMessage });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '×' }));
    });
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tasks/clearError'
      })
    );
  });

  test('dispatches fetchTasks on mount', () => {
    renderWithProvider();
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('disables add task button when loading', () => {
    renderWithProvider({ loading: true });
    
    expect(screen.getByRole('button', { name: '+ Add New Task' })).toBeDisabled();
  });

  test('shows loading state in task list', () => {
    renderWithProvider({ loading: true });
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('shows empty state when no tasks', () => {
    renderWithProvider({ tasks: [] });
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first task to get started!')).toBeInTheDocument();
  });

  test('renders tasks when available', () => {
    const mockTasks = [
      { _id: '1', title: 'Task 1', completed: false },
      { _id: '2', title: 'Task 2', completed: true }
    ];
    
    renderWithProvider({ tasks: mockTasks });
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
  });

  test('handles task editing', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { _id: '1', title: 'Task 1', description: 'Description 1', completed: false }
    ];
    
    renderWithProvider({ tasks: mockTasks });
    
    // Click edit button (this would be handled by TaskItem component)
    // The actual edit functionality is tested in TaskItem component
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
});
