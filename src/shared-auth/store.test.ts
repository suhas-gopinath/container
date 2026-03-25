import { store, selectAccessToken } from './store';
import { setAccessToken, clearAccessToken } from './authSlice';

describe('Redux Store', () => {
  test('store should be defined', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });

  test('initial state should have null access token', () => {
    const state = store.getState();
    expect(state.auth.accessToken).toBeNull();
  });

  test('selectAccessToken should return access token from state', () => {
    const state = store.getState();
    const token = selectAccessToken(state);
    expect(token).toBeNull();
  });

  test('dispatch setAccessToken should update store', () => {
    const testToken = 'test-jwt-token-456';
    store.dispatch(setAccessToken(testToken));
    
    const state = store.getState();
    expect(selectAccessToken(state)).toEqual(testToken);
  });

  test('dispatch clearAccessToken should clear token from store', () => {
    // First set a token
    store.dispatch(setAccessToken('token-to-clear'));
    expect(selectAccessToken(store.getState())).toEqual('token-to-clear');
    
    // Then clear it
    store.dispatch(clearAccessToken());
    expect(selectAccessToken(store.getState())).toBeNull();
  });
});