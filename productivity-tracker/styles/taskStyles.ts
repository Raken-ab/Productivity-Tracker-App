import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const taskStyles = StyleSheet.create({
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

    taskCardCompleted: {
        opacity: 0.5,
        backgroundColor: colors.completed,
    },

    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },

    taskType: {
        fontSize: 12,
        fontWeight: '500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },

    taskTypeUnit: {
        backgroundColor: colors.unit,
        color: colors.textPrimary,
    },

    taskTypeDaily: {
        backgroundColor: colors.daily,
        color: colors.textPrimary,
    },

    taskTypeClean: {
        backgroundColor: colors.clean,
        color: colors.textPrimary,
    },

    taskDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },

    taskProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    progressText: {
        fontSize: 14,
        color: colors.textSecondary,
        minWidth: 80,
    },

    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.progressBackground,
        borderRadius: 3,
        marginLeft: 8,
    },

    progressFill: {
        height: '100%',
        backgroundColor: colors.progressFill,
        borderRadius: 3,
    },

    taskStreak: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    streakText: {
        fontSize: 12,
        color: colors.textMuted,
    },

    streakCount: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
    },

    completedIndicator: {
        fontSize: 18,
        color: colors.success,
    },

    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },

    swipeActionText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});