/**
 * This utility file helps migrate components from using AuthContext directly 
 * to using the useAuth hook.
 * 
 * How to use:
 * 1. Replace the import: 
 *    import { AuthContext } from '../../contexts/AuthContext';
 *    with:
 *    import { AuthContext } from '../../utils/contextMigration';
 * 
 * 2. Later, refactor all components to use useAuth() hook directly
 */

import { AuthContext as ActualAuthContext, useAuth } from '../contexts/AuthContext';

// Re-export the actual context so existing useContext calls still work
export const AuthContext = ActualAuthContext;

// Additional note:
// The proper way for components to use auth is with the useAuth hook:
// import { useAuth } from '../contexts/AuthContext';
// const { currentUser, login, logout, etc. } = useAuth();
