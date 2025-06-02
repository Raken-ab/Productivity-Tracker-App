/**
 * taskHelpers.ts
 * --------------
 * Contains the Task interface and utility functions for creating, updating,
 * completing, resetting, and displaying progress for tasks in the Productivity Tracker app.
 * All logic related to task state and calculations is centralized here.
 */

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: 'unit' | 'daily' | 'clean';
    targetValue?: number; // For unit tasks
    currentValue?: number; // For unit tasks
    completed: boolean;
    streak: number;
    lastCompletedDate?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Creates a new Task object with default values.
 */
export const createTask = (
    title: string,
    type: 'unit' | 'daily' | 'clean',
    description?: string,
    targetValue?: number
): Task => {
    const now = new Date().toISOString();
    return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title,
        description,
        type,
        targetValue: type === 'unit' ? targetValue || 1 : undefined,
        currentValue: type === 'unit' ? 0 : undefined,
        completed: false,
        streak: 0,
        createdAt: now,
        updatedAt: now,
    };
};

/**
 * Checks if a task is completed.
 */
export const isTaskCompleted = (task: Task): boolean => {
    if (task.type === 'unit') {
        return (task.currentValue || 0) >= (task.targetValue || 1);
    }
    return task.completed;
};

/**
 * Determines if a task should be reset for a new day.
 */
export const shouldResetTask = (task: Task): boolean => {
    if (!task.lastCompletedDate) return false;

    const lastCompleted = new Date(task.lastCompletedDate);
    const today = new Date();

    // Check if it's a new day
    return (
        lastCompleted.getDate() !== today.getDate() ||
        lastCompleted.getMonth() !== today.getMonth() ||
        lastCompleted.getFullYear() !== today.getFullYear()
    );
};

/**
 * Resets a task for a new day and updates the streak if completed yesterday.
 */
export const resetTaskForNewDay = (task: Task): Task => {
    const wasCompletedYesterday = task.completed || isTaskCompleted(task);

    return {
        ...task,
        completed: false,
        currentValue: task.type === 'unit' ? 0 : undefined,
        streak: wasCompletedYesterday ? task.streak + 1 : 0,
        updatedAt: new Date().toISOString(),
    };
};

/**
 * Marks a task as completed and updates relevant fields.
 */
export const completeTask = (task: Task): Task => {
    const now = new Date().toISOString();

    if (task.type === 'unit') {
        return {
            ...task,
            currentValue: task.targetValue || 1,
            completed: true,
            lastCompletedDate: now,
            updatedAt: now,
        };
    }

    return {
        ...task,
        completed: true,
        lastCompletedDate: now,
        updatedAt: now,
    };
};

/**
 * Updates the progress of a unit task.
 */
export const updateTaskProgress = (task: Task, newValue: number): Task => {
    if (task.type !== 'unit') return task;

    const currentValue = Math.max(0, Math.min(newValue, task.targetValue || 1));
    const completed = currentValue >= (task.targetValue || 1);

    return {
        ...task,
        currentValue,
        completed,
        lastCompletedDate: completed ? new Date().toISOString() : task.lastCompletedDate,
        updatedAt: new Date().toISOString(),
    };
};

/**
 * Returns the progress (0 to 1) for a task.
 */
export const getTaskProgress = (task: Task): number => {
    if (task.type !== 'unit') return task.completed ? 1 : 0;
    return Math.min((task.currentValue || 0) / (task.targetValue || 1), 1);
};

/**
 * Returns a string representing the progress for a unit task.
 */
export const getProgressText = (task: Task): string => {
    if (task.type !== 'unit') return '';
    return `${task.currentValue || 0} / ${task.targetValue || 1}`;
};

/**
 * Returns a string representing the streak for a task.
 */
export const getStreakText = (task: Task): string => {
    if (task.type === 'unit') return '';
    if (task.streak === 0) return 'No streak yet';
    return `${task.streak} day${task.streak === 1 ? '' : 's'} streak`;
};