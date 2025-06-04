// EventContext.tsx - Data persistence layer
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Event {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    color: string;
    date: string;
    isAllDay: boolean;
    reminder?: number; // minutes before event
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
    createdAt: string;
    updatedAt: string;
}

interface EventState {
    events: Event[];
    loading: boolean;
    error: string | null;
}

type EventAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'LOAD_EVENTS'; payload: Event[] }
    | { type: 'ADD_EVENT'; payload: Event }
    | { type: 'UPDATE_EVENT'; payload: Event }
    | { type: 'DELETE_EVENT'; payload: string };

const initialState: EventState = {
    events: [],
    loading: false,
    error: null,
};

const eventReducer = (state: EventState, action: EventAction): EventState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'LOAD_EVENTS':
            return { ...state, events: action.payload, loading: false };
        case 'ADD_EVENT':
            return { ...state, events: [...state.events, action.payload] };
        case 'UPDATE_EVENT':
            return {
                ...state,
                events: state.events.map(event =>
                    event.id === action.payload.id ? action.payload : event
                ),
            };
        case 'DELETE_EVENT':
            return {
                ...state,
                events: state.events.filter(event => event.id !== action.payload),
            };
        default:
            return state;
    }
};

interface EventContextType {
    state: EventState;
    addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateEvent: (event: Event) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getEventsForDate: (date: string) => Event[];
    getEventsForMonth: (year: number, month: number) => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEY = '@calendar_events';

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(eventReducer, initialState);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedEvents) {
                const events = JSON.parse(storedEvents);
                dispatch({ type: 'LOAD_EVENTS', payload: events });
            } else {
                dispatch({ type: 'LOAD_EVENTS', payload: [] });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load events' });
        }
    };

    const saveEvents = async (events: Event[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (error) {
            throw new Error('Failed to save events');
        }
    };

    const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newEvent: Event = {
                ...eventData,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const updatedEvents = [...state.events, newEvent];
            await saveEvents(updatedEvents);
            dispatch({ type: 'ADD_EVENT', payload: newEvent });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to add event' });
        }
    };

    const updateEvent = async (event: Event) => {
        try {
            const updatedEvent = { ...event, updatedAt: new Date().toISOString() };
            const updatedEvents = state.events.map(e =>
                e.id === event.id ? updatedEvent : e
            );
            await saveEvents(updatedEvents);
            dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to update event' });
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            const updatedEvents = state.events.filter(e => e.id !== id);
            await saveEvents(updatedEvents);
            dispatch({ type: 'DELETE_EVENT', payload: id });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete event' });
        }
    };

    const getEventsForDate = (date: string): Event[] => {
        return state.events.filter(event => event.date === date);
    };

    const getEventsForMonth = (year: number, month: number): Event[] => {
        return state.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
    };

    return (
        <EventContext.Provider
            value={{
                state,
                addEvent,
                updateEvent,
                deleteEvent,
                getEventsForDate,
                getEventsForMonth,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};