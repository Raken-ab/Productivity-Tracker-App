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

export const isTaskCompleted = (task: Task): boolean => {
    if (task.type === 'unit') {
        return (task.currentValue || 0) >= (task.targetValue || 1);
    }
    return task.completed;
};

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

export const getTaskProgress = (task: Task): number => {
    if (task.type !== 'unit') return task.completed ? 1 : 0;
    return Math.min((task.currentValue || 0) / (task.targetValue || 1), 1);
};

export const getProgressText = (task: Task): string => {
    if (task.type !== 'unit') return '';
    return `${task.currentValue || 0} / ${task.targetValue || 1}`;
};

export const getStreakText = (task: Task): string => {
    if (task.type === 'unit') return '';
    if (task.streak === 0) return 'No streak yet';
    return `${task.streak} day${task.streak === 1 ? '' : 's'} streak`;
};