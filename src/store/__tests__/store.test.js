import { store } from '../store';

describe('Store', () => {
  test('should have the correct initial state', () => {
    const state = store.getState();
    
    expect(state).toHaveProperty('tasks');
    expect(state.tasks).toEqual({
      tasks: [],
      loading: false,
      error: null
    });
  });

  test('should have tasks reducer configured', () => {
    const state = store.getState();
    
    expect(state.tasks).toBeDefined();
    expect(typeof state.tasks).toBe('object');
  });

  test('should be able to dispatch actions', () => {
    const initialState = store.getState();
    
    // Dispatch a clearError action
    store.dispatch({ type: 'tasks/clearError' });
    
    const newState = store.getState();
    expect(newState).toBeDefined();
    expect(newState.tasks).toBeDefined();
  });
});

