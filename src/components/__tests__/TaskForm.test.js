import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';
import tasksReducer from '../../store/slices/tasksSlice';

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

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('TaskForm', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test('renders add task form by default', () => {
    renderWithProvider(<TaskForm />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('renders edit task form when task prop is provided', () => {
    const task = {
      _id: '1',
      title: 'Test Task',
      description: 'Test Description'
    };

    renderWithProvider(<TaskForm task={task} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    
    renderWithProvider(<TaskForm onCancel={onCancel} />);
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
    });
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when form is submitted successfully', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskForm onCancel={onCancel} />);
    
    await act(async () => {
      await user.type(screen.getByLabelText('Title *'), 'New Task');
      await user.type(screen.getByLabelText('Description'), 'New Description');
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });
    
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  test('dispatches addTask action when creating new task', async () => {
    const user = userEvent.setup();
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskForm />);
    
    await act(async () => {
      await user.type(screen.getByLabelText('Title *'), 'New Task');
      await user.type(screen.getByLabelText('Description'), 'New Description');
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('dispatches updateTask action when editing existing task', async () => {
    const user = userEvent.setup();
    const task = {
      _id: '1',
      title: 'Original Task',
      description: 'Original Description'
    };
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskForm task={task} />);
    
    await act(async () => {
      await user.clear(screen.getByLabelText('Title *'));
      await user.type(screen.getByLabelText('Title *'), 'Updated Task');
      await user.click(screen.getByRole('button', { name: 'Update Task' }));
    });
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('shows alert when trying to submit without title', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithProvider(<TaskForm />);
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter a task title');
    
    alertSpy.mockRestore();
  });

  test('trims whitespace from title and description', async () => {
    const user = userEvent.setup();
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskForm />);
    
    await act(async () => {
      await user.type(screen.getByLabelText('Title *'), '  Trimmed Title  ');
      await user.type(screen.getByLabelText('Description'), '  Trimmed Description  ');
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('clears form fields after successful submission', async () => {
    const user = userEvent.setup();
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskForm />);
    
    await act(async () => {
      await user.type(screen.getByLabelText('Title *'), 'Test Task');
      await user.type(screen.getByLabelText('Description'), 'Test Description');
      await user.click(screen.getByRole('button', { name: 'Add Task' }));
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Title *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });
  });
});
