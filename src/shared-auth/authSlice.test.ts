import authReducer, { setAccessToken, clearAccessToken, AuthState } from './authSlice';

describe('authSlice', () => {
  const initialState: AuthState = {
    accessToken: null,
  };

  describe('reducers', () => {
    test('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    test('setAccessToken should set the access token', () => {
      const token = 'test-jwt-token-123';
      const actual = authReducer(initialState, setAccessToken(token));
      expect(actual.accessToken).toEqual(token);
    });

    test('setAccessToken should update existing token', () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      const stateWithToken: AuthState = { accessToken: oldToken };
      const actual = authReducer(stateWithToken, setAccessToken(newToken));
      expect(actual.accessToken).toEqual(newToken);
    });

    test('clearAccessToken should clear the access token', () => {
      const stateWithToken: AuthState = { accessToken: 'test-token' };
      const actual = authReducer(stateWithToken, clearAccessToken());
      expect(actual.accessToken).toBeNull();
    });

    test('clearAccessToken on empty state should remain null', () => {
      const actual = authReducer(initialState, clearAccessToken());
      expect(actual.accessToken).toBeNull();
    });
  });
});