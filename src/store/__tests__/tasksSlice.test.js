import tasksReducer, { 
  fetchTasks, 
  addTask, 
  updateTask, 
  toggleTask, 
  deleteTask, 
  clearError 
} from '../slices/tasksSlice';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Create a mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });
};

describe('tasksSlice', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null
  };

  describe('reducers', () => {
    test('should return initial state', () => {
      expect(tasksReducer(undefined, {})).toEqual(initialState);
    });

    test('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error message'
      };

      const newState = tasksReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });
  });

  describe('fetchTasks', () => {
    test('should handle fetchTasks.pending', () => {
      const action = { type: fetchTasks.pending.type };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('should handle fetchTasks.fulfilled', () => {
      const tasks = [
        { _id: '1', title: 'Task 1', completed: false },
        { _id: '2', title: 'Task 2', completed: true }
      ];
      const action = { 
        type: fetchTasks.fulfilled.type, 
        payload: tasks 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.tasks).toEqual(tasks);
    });

    test('should handle fetchTasks.rejected', () => {
      const error = 'Failed to fetch tasks';
      const action = { 
        type: fetchTasks.rejected.type, 
        payload: error 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('addTask', () => {
    test('should handle addTask.pending', () => {
      const action = { type: addTask.pending.type };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('should handle addTask.fulfilled', () => {
      const existingTasks = [
        { _id: '1', title: 'Existing Task', completed: false }
      ];
      const stateWithTasks = {
        ...initialState,
        tasks: existingTasks
      };
      
      const newTask = { _id: '2', title: 'New Task', completed: false };
      const action = { 
        type: addTask.fulfilled.type, 
        payload: newTask 
      };
      const newState = tasksReducer(stateWithTasks, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.tasks).toHaveLength(2);
      expect(newState.tasks[0]).toEqual(newTask); // Should be added to beginning
      expect(newState.tasks[1]).toEqual(existingTasks[0]);
    });

    test('should handle addTask.rejected', () => {
      const error = 'Failed to add task';
      const action = { 
        type: addTask.rejected.type, 
        payload: error 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('updateTask', () => {
    test('should handle updateTask.pending', () => {
      const action = { type: updateTask.pending.type };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('should handle updateTask.fulfilled', () => {
      const existingTasks = [
        { _id: '1', title: 'Original Task', completed: false },
        { _id: '2', title: 'Another Task', completed: false }
      ];
      const stateWithTasks = {
        ...initialState,
        tasks: existingTasks
      };
      
      const updatedTask = { _id: '1', title: 'Updated Task', completed: true };
      const action = { 
        type: updateTask.fulfilled.type, 
        payload: updatedTask 
      };
      const newState = tasksReducer(stateWithTasks, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.tasks[0]).toEqual(updatedTask);
      expect(newState.tasks[1]).toEqual(existingTasks[1]); // Unchanged
    });

    test('should handle updateTask.rejected', () => {
      const error = 'Failed to update task';
      const action = { 
        type: updateTask.rejected.type, 
        payload: error 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('toggleTask', () => {
    test('should handle toggleTask.pending', () => {
      const action = { type: toggleTask.pending.type };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('should handle toggleTask.fulfilled', () => {
      const existingTasks = [
        { _id: '1', title: 'Task 1', completed: false },
        { _id: '2', title: 'Task 2', completed: true }
      ];
      const stateWithTasks = {
        ...initialState,
        tasks: existingTasks
      };
      
      const toggledTask = { _id: '1', title: 'Task 1', completed: true };
      const action = { 
        type: toggleTask.fulfilled.type, 
        payload: toggledTask 
      };
      const newState = tasksReducer(stateWithTasks, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.tasks[0]).toEqual(toggledTask);
      expect(newState.tasks[1]).toEqual(existingTasks[1]); // Unchanged
    });

    test('should handle toggleTask.rejected', () => {
      const error = 'Failed to toggle task';
      const action = { 
        type: toggleTask.rejected.type, 
        payload: error 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('deleteTask', () => {
    test('should handle deleteTask.pending', () => {
      const action = { type: deleteTask.pending.type };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('should handle deleteTask.fulfilled', () => {
      const existingTasks = [
        { _id: '1', title: 'Task 1', completed: false },
        { _id: '2', title: 'Task 2', completed: true }
      ];
      const stateWithTasks = {
        ...initialState,
        tasks: existingTasks
      };
      
      const action = { 
        type: deleteTask.fulfilled.type, 
        payload: '1' // Task ID to delete
      };
      const newState = tasksReducer(stateWithTasks, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.tasks).toHaveLength(1);
      expect(newState.tasks[0]).toEqual(existingTasks[1]); // Only remaining task
    });

    test('should handle deleteTask.rejected', () => {
      const error = 'Failed to delete task';
      const action = { 
        type: deleteTask.rejected.type, 
        payload: error 
      };
      const newState = tasksReducer(initialState, action);
      
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('async thunk actions', () => {
    test('fetchTasks should create correct action types', () => {
      expect(fetchTasks.pending.type).toBe('tasks/fetchTasks/pending');
      expect(fetchTasks.fulfilled.type).toBe('tasks/fetchTasks/fulfilled');
      expect(fetchTasks.rejected.type).toBe('tasks/fetchTasks/rejected');
    });

    test('addTask should create correct action types', () => {
      expect(addTask.pending.type).toBe('tasks/addTask/pending');
      expect(addTask.fulfilled.type).toBe('tasks/addTask/fulfilled');
      expect(addTask.rejected.type).toBe('tasks/addTask/rejected');
    });

    test('updateTask should create correct action types', () => {
      expect(updateTask.pending.type).toBe('tasks/updateTask/pending');
      expect(updateTask.fulfilled.type).toBe('tasks/updateTask/fulfilled');
      expect(updateTask.rejected.type).toBe('tasks/updateTask/rejected');
    });

    test('toggleTask should create correct action types', () => {
      expect(toggleTask.pending.type).toBe('tasks/toggleTask/pending');
      expect(toggleTask.fulfilled.type).toBe('tasks/toggleTask/fulfilled');
      expect(toggleTask.rejected.type).toBe('tasks/toggleTask/rejected');
    });

    test('deleteTask should create correct action types', () => {
      expect(deleteTask.pending.type).toBe('tasks/deleteTask/pending');
      expect(deleteTask.fulfilled.type).toBe('tasks/deleteTask/fulfilled');
      expect(deleteTask.rejected.type).toBe('tasks/deleteTask/rejected');
    });
  });

  describe('Error handling in async thunks', () => {
    let store;

    beforeEach(() => {
      store = createMockStore();
      // Reset axios mock
      mockedAxios.get.mockClear();
      mockedAxios.post.mockClear();
      mockedAxios.put.mockClear();
      mockedAxios.patch.mockClear();
      mockedAxios.delete.mockClear();
    });

    test('fetchTasks should handle API error with response message', async () => {
      const errorMessage = 'Server error';
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const action = fetchTasks();
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/fetchTasks/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    test('fetchTasks should handle API error without response message', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const action = fetchTasks();
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/fetchTasks/rejected');
      expect(result.payload).toBe('Failed to fetch tasks');
    });

    test('addTask should handle API error with response message', async () => {
      const errorMessage = 'Validation error';
      const taskData = { title: 'Test Task' };
      
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const action = addTask(taskData);
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/addTask/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    test('addTask should handle API error without response message', async () => {
      const taskData = { title: 'Test Task' };
      
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const action = addTask(taskData);
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/addTask/rejected');
      expect(result.payload).toBe('Failed to add task');
    });

    test('updateTask should handle API error with response message', async () => {
      const errorMessage = 'Task not found';
      const updateData = { id: '1', taskData: { title: 'Updated Task' } };
      
      mockedAxios.put.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const action = updateTask(updateData);
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/updateTask/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    test('updateTask should handle API error without response message', async () => {
      const updateData = { id: '1', taskData: { title: 'Updated Task' } };
      
      mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));

      const action = updateTask(updateData);
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/updateTask/rejected');
      expect(result.payload).toBe('Failed to update task');
    });

    test('toggleTask should handle API error with response message', async () => {
      const errorMessage = 'Task not found';
      
      mockedAxios.patch.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const action = toggleTask('1');
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/toggleTask/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    test('toggleTask should handle API error without response message', async () => {
      mockedAxios.patch.mockRejectedValueOnce(new Error('Network error'));

      const action = toggleTask('1');
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/toggleTask/rejected');
      expect(result.payload).toBe('Failed to toggle task');
    });

    test('deleteTask should handle API error with response message', async () => {
      const errorMessage = 'Task not found';
      
      mockedAxios.delete.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      const action = deleteTask('1');
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/deleteTask/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    test('deleteTask should handle API error without response message', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      const action = deleteTask('1');
      const result = await action(store.dispatch, store.getState, undefined);
      
      expect(result.type).toBe('tasks/deleteTask/rejected');
      expect(result.payload).toBe('Failed to delete task');
    });
  });
});
