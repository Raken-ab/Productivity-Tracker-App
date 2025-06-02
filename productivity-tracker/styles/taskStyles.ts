/**
 * taskStyles.ts
 * -------------
 * Contains all the StyleSheet definitions for task-related UI components in the Productivity Tracker app.
 * Edit this file to change the appearance of task cards, progress bars, streaks, swipe actions, and other task visuals.
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const taskStyles = StyleSheet.create({
    // Styles for the main task card container
    taskCard: {
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    // Styles for a completed task card
    taskCardCompleted: {
        opacity: 0.5,
        backgroundColor: colors.completed,
    },

    // Header row in the task card (title and actions)
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    // Task title text
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },

    // Task type badge (unit, daily, clean)
    taskType: {
        fontSize: 12,
        fontWeight: '500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },

    // Badge color for unit tasks
    taskTypeUnit: {
        backgroundColor: colors.unit,
        color: colors.textPrimary,
    },

    // Badge color for daily tasks
    taskTypeDaily: {
        backgroundColor: colors.daily,
        color: colors.textPrimary,
    },

    // Badge color for clean tasks
    taskTypeClean: {
        backgroundColor: colors.clean,
        color: colors.textPrimary,
    },

    // Task description text
    taskDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },

    // Container for progress bar and text
    taskProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    // Progress text (e.g., "2 / 5")
    progressText: {
        fontSize: 14,
        color: colors.textSecondary,
        minWidth: 80,
    },

    // Progress bar background
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.progressBackground,
        borderRadius: 3,
        marginLeft: 8,
    },

    // Progress bar fill
    progressFill: {
        height: '100%',
        backgroundColor: colors.progressFill,
        borderRadius: 3,
    },

    // Container for streak info
    taskStreak: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Streak label text
    streakText: {
        fontSize: 12,
        color: colors.textMuted,
    },

    // Streak count number
    streakCount: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
    },

    // Checkmark or indicator for completed tasks
    completedIndicator: {
        fontSize: 18,
        color: colors.success,
    },

    // Swipe action button container (for swipe-to-complete/delete)
    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },

    // Text inside swipe action button
    swipeActionText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});