import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const initialState = {
  watchlist: ['bitcoin', 'ethereum', 'solana'],
  portfolio: [],
  apiKey: '',
  currency: 'usd',
};

const STORAGE_KEY = 'crypto_tracker_v1';

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TO_WATCHLIST':
      if (state.watchlist.includes(action.coinId)) return state;
      return { ...state, watchlist: [...state.watchlist, action.coinId] };
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(id => id !== action.coinId),
        portfolio: state.portfolio.filter(p => p.coinId !== action.coinId),
      };
    case 'ADD_PORTFOLIO_ENTRY': {
      const exists = state.portfolio.find(p => p.coinId === action.payload.coinId);
      if (exists) {
        return {
          ...state,
          portfolio: state.portfolio.map(p =>
            p.coinId === action.payload.coinId
              ? { ...p, amount: p.amount + action.payload.amount }
              : p
          ),
        };
      }
      return { ...state, portfolio: [...state.portfolio, action.payload] };
    }
    case 'UPDATE_PORTFOLIO_ENTRY':
      return {
        ...state,
        portfolio: state.portfolio.map(p =>
          p.coinId === action.payload.coinId ? { ...p, ...action.payload } : p
        ),
      };
    case 'REMOVE_PORTFOLIO_ENTRY':
      return { ...state, portfolio: state.portfolio.filter(p => p.coinId !== action.coinId) };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.apiKey };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const [stored, apiKey] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem('claude_api_key'),
        ]);
        if (stored) dispatch({ type: 'LOAD_STATE', payload: JSON.parse(stored) });
        if (apiKey) dispatch({ type: 'SET_API_KEY', apiKey });
      } catch (e) {
        console.error('Error loading state:', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ watchlist: state.watchlist, portfolio: state.portfolio, currency: state.currency })
    ).catch(console.error);
  }, [state.watchlist, state.portfolio, state.currency]);

  const setApiKey = async (key) => {
    await AsyncStorage.setItem('claude_api_key', key);
    dispatch({ type: 'SET_API_KEY', apiKey: key });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, setApiKey }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
