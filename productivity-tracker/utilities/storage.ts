import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, shouldResetTask, resetTaskForNewDay } from './taskHelpers';

const TASKS_KEY = '@productivity_tasks';
const LAST_RESET_KEY = '@last_reset_date';

export const saveTasks = async (tasks: Task[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(tasks);
        await AsyncStorage.setItem(TASKS_KEY, jsonValue);
    } catch (error) {
        console.error('Error saving tasks:', error);
        throw error;
    }
};

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

export const clearAllTasks = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(TASKS_KEY);
        await AsyncStorage.removeItem(LAST_RESET_KEY);
    } catch (error) {
        console.error('Error clearing tasks:', error);
        throw error;
    }
};