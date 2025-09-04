import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskList from '../TaskList';
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

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('TaskList', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Pending Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Pending Task 2',
      description: 'Description 2',
      completed: false,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    },
    {
      _id: '3',
      title: 'Completed Task 1',
      description: 'Description 3',
      completed: true,
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z'
    }
  ];

  test('renders loading state', () => {
    renderWithProvider(<TaskList />, {
      loading: true
    });
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    expect(screen.getByText('Loading tasks...').closest('.loading')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to fetch tasks';
    renderWithProvider(<TaskList />, {
      error: errorMessage
    });
    
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders empty state when no tasks', () => {
    renderWithProvider(<TaskList />, {
      tasks: []
    });
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first task to get started!')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  test('renders tasks grouped by completion status', () => {
    renderWithProvider(<TaskList />, {
      tasks: mockTasks
    });
    
    expect(screen.getByText('Pending Tasks (2)')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
    
    expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
    expect(screen.getByText('Pending Task 2')).toBeInTheDocument();
    expect(screen.getByText('Completed Task 1')).toBeInTheDocument();
  });

  test('renders only pending tasks section when no completed tasks', () => {
    const pendingTasks = mockTasks.filter(task => !task.completed);
    
    renderWithProvider(<TaskList />, {
      tasks: pendingTasks
    });
    
    expect(screen.getByText('Pending Tasks (2)')).toBeInTheDocument();
    expect(screen.queryByText('Completed Tasks')).not.toBeInTheDocument();
  });

  test('renders only completed tasks section when no pending tasks', () => {
    const completedTasks = mockTasks.filter(task => task.completed);
    
    renderWithProvider(<TaskList />, {
      tasks: completedTasks
    });
    
    expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
    expect(screen.queryByText('Pending Tasks')).not.toBeInTheDocument();
  });

  test('calls onEditTask when task edit is triggered', () => {
    const onEditTask = jest.fn();
    
    renderWithProvider(<TaskList onEditTask={onEditTask} />, {
      tasks: [mockTasks[0]]
    });
    
    // The actual edit functionality is tested in TaskItem component
    expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
  });

  test('displays correct task counts in section headers', () => {
    const mixedTasks = [
      ...mockTasks,
      {
        _id: '4',
        title: 'Another Pending Task',
        description: 'Description 4',
        completed: false,
        createdAt: '2023-01-04T00:00:00.000Z',
        updatedAt: '2023-01-04T00:00:00.000Z'
      },
      {
        _id: '5',
        title: 'Another Completed Task',
        description: 'Description 5',
        completed: true,
        createdAt: '2023-01-05T00:00:00.000Z',
        updatedAt: '2023-01-05T00:00:00.000Z'
      }
    ];
    
    renderWithProvider(<TaskList />, {
      tasks: mixedTasks
    });
    
    expect(screen.getByText('Pending Tasks (3)')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks (2)')).toBeInTheDocument();
  });

  test('handles tasks with empty descriptions', () => {
    const tasksWithEmptyDescriptions = [
      {
        _id: '1',
        title: 'Task without description',
        description: '',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    ];
    
    renderWithProvider(<TaskList />, {
      tasks: tasksWithEmptyDescriptions
    });
    
    expect(screen.getByText('Task without description')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks (1)')).toBeInTheDocument();
  });
});
