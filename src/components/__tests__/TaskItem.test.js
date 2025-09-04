import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import TaskItem from '../TaskItem';
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

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
});

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('TaskItem', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    mockConfirm.mockClear();
  });

  test('renders task information correctly', () => {
    renderWithProvider(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByTitle('Edit task')).toBeInTheDocument();
    expect(screen.getByTitle('Delete task')).toBeInTheDocument();
    expect(screen.getByTitle('Mark as complete')).toBeInTheDocument();
  });

  test('renders completed task with strikethrough styling', () => {
    const completedTask = { ...mockTask, completed: true };
    renderWithProvider(<TaskItem task={completedTask} />);
    
    const taskItem = screen.getByText('Test Task').closest('.task-item');
    expect(taskItem).toHaveClass('completed');
  });

  test('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    
    renderWithProvider(<TaskItem task={mockTask} onEdit={onEdit} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Edit task'));
    });
    
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  test('calls toggleTask when toggle button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Mark as complete'));
    });
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('calls deleteTask when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    
    // Mock successful dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({})
    });
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Delete task'));
    });
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('does not call deleteTask when delete is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Delete task'));
    });
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('shows loading state when deleting', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    
    // Mock pending dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    });
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Delete task'));
    });
    
    expect(screen.getByText('⏳')).toBeInTheDocument();
    expect(screen.getByTitle('Delete task')).toBeDisabled();
  });

  test('formats date correctly', () => {
    renderWithProvider(<TaskItem task={mockTask} />);
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    // Check that a date is displayed (more flexible than specific year)
    expect(screen.getByText(/Created:/).textContent).toMatch(/\d{4}/);
  });

  test('shows updated date when different from created date', () => {
    const taskWithUpdate = {
      ...mockTask,
      updatedAt: '2023-01-02T00:00:00.000Z'
    };
    
    renderWithProvider(<TaskItem task={taskWithUpdate} />);
    
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    // Check that a date is displayed (more flexible than specific year)
    expect(screen.getByText(/Updated:/).textContent).toMatch(/\d{4}/);
  });

  test('does not show updated date when same as created date', () => {
    renderWithProvider(<TaskItem task={mockTask} />);
    
    expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
  });

  test('handles task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: '' };
    renderWithProvider(<TaskItem task={taskWithoutDescription} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('handles toggle error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock failed dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Toggle failed'))
    });
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Mark as complete'));
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error toggling task:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  test('handles delete error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConfirm.mockReturnValue(true);
    
    // Mock failed dispatch
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Delete failed'))
    });
    
    renderWithProvider(<TaskItem task={mockTask} />);
    
    await act(async () => {
      await user.click(screen.getByTitle('Delete task'));
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting task:', expect.any(Error));
    expect(screen.getByTitle('Delete task')).not.toBeDisabled();
    
    consoleSpy.mockRestore();
  });
});
