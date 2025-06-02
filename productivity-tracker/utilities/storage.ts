/**
 * storage.ts
 * ----------
 * Provides AsyncStorage helper functions for saving, loading, updating, and deleting
 * tasks in the Productivity Tracker app. Also handles daily reset logic for tasks.
 * All persistent storage and reset logic is centralized here.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, shouldResetTask, resetTaskForNewDay } from './taskHelpers';

const TASKS_KEY = '@productivity_tasks';
const LAST_RESET_KEY = '@last_reset_date';

/**
 * Saves the entire list of tasks to AsyncStorage.
 */
export const saveTasks = async (tasks: Task[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(tasks);
        await AsyncStorage.setItem(TASKS_KEY, jsonValue);
    } catch (error) {
        console.error('Error saving tasks:', error);
        throw error;
    }
};

/**
 * Loads all tasks from AsyncStorage and checks if they need to be reset for a new day.
 */
export const loadTasks = async (): Promise<Task[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
        if (jsonValue === null) {
            return [];
        }

        const tasks: Task[] = JSON.parse(jsonValue);

        // Check if we need to reset tasks for a new day
        const resetTasks = await checkAndResetTasks(tasks);

        return resetTasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
};

/**
 * Checks if a new day has started and resets tasks if needed.
 * Updates the last reset date and saves the reset tasks.
 */
export const checkAndResetTasks = async (tasks: Task[]): Promise<Task[]> => {
    try {
        const today = new Date().toDateString();
        const lastResetDate = await AsyncStorage.getItem(LAST_RESET_KEY);

        // If it's a new day, reset all tasks
        if (lastResetDate !== today) {
            const resetTasks = tasks.map(task => {
                if (shouldResetTask(task)) {
                    return resetTaskForNewDay(task);
                }
                return task;
            });

            // Save the reset date
            await AsyncStorage.setItem(LAST_RESET_KEY, today);

            // Save the reset tasks
            if (resetTasks.length > 0) {
                await saveTasks(resetTasks);
            }

            return resetTasks;
        }

        return tasks;
    } catch (error) {
        console.error('Error checking/resetting tasks:', error);
        return tasks;
    }
};

/**
 * Saves a single task (add or update) and returns the updated task list.
 */
export const saveTask = async (task: Task, existingTasks: Task[]): Promise<Task[]> => {
    try {
        const taskIndex = existingTasks.findIndex(t => t.id === task.id);
        let updatedTasks: Task[];

        if (taskIndex >= 0) {
            // Update existing task
            updatedTasks = [...existingTasks];
            updatedTasks[taskIndex] = task;
        } else {
            // Add new task
            updatedTasks = [...existingTasks, task];
        }

        await saveTasks(updatedTasks);
        return updatedTasks;
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
};

/**
 * Deletes a task by ID and returns the updated task list.
 */
export const deleteTask = async (taskId: string, existingTasks: Task[]): Promise<Task[]> => {
    try {
        const updatedTasks = existingTasks.filter(task => task.id !== taskId);
        await saveTasks(updatedTasks);
        return updatedTasks;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

/**
 * Clears all tasks and reset data from AsyncStorage.
 */
export const clearAllTasks = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(TASKS_KEY);
        await AsyncStorage.removeItem(LAST_RESET_KEY);
    } catch (error) {
        console.error('Error clearing tasks:', error);
        throw error;
    }
};