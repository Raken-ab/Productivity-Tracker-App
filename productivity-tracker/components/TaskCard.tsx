/**
 * TaskCard.tsx
 * ------------
 * Swipeable task card component for the Productivity Tracker app.
 * Displays task details, progress, streak, and allows swipe-to-complete functionality.
 * Tapping the card opens the edit modal for the task.
 * Edit this file to change how each task is displayed or how swipe actions work.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task, isTaskCompleted, getTaskProgress, getProgressText, getStreakText } from '../utilities/taskHelpers';
import { taskStyles } from '../styles/taskStyles';
import { colors } from '../styles/colors';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onComplete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onComplete }) => {
    const completed = isTaskCompleted(task);
    const progress = getTaskProgress(task);
    const progressText = getProgressText(task);
    const streakText = getStreakText(task);

    // Renders the swipe action for completing a task
    const renderRightAction = () => {
        return (
            <Animated.View style={[taskStyles.swipeAction, { backgroundColor: colors.success }]}>
                <Text style={taskStyles.swipeActionText}>✓</Text>
                <Text style={taskStyles.swipeActionText}>Complete</Text>
            </Animated.View>
        );
    };

    // Handles the swipe-to-complete action
    const handleSwipeRight = () => {
        if (!completed) {
            onComplete(task);
        }
    };

    // Returns the style for the task type badge
    const getTypeColor = () => {
        switch (task.type) {
            case 'unit':
                return taskStyles.taskTypeUnit;
            case 'daily':
                return taskStyles.taskTypeDaily;
            case 'clean':
                return taskStyles.taskTypeClean;
            default:
                return taskStyles.taskTypeDaily;
        }
    };

    // Returns the label for the task type badge
    const getTypeLabel = () => {
        switch (task.type) {
            case 'unit':
                return 'UNIT';
            case 'daily':
                return 'DAILY';
            case 'clean':
                return 'CLEAN';
            default:
                return 'TASK';
        }
    };

    return (
        <Swipeable
            renderRightActions={completed ? undefined : renderRightAction}
            onSwipeableRightOpen={handleSwipeRight}
            rightThreshold={40}
        >
            <TouchableOpacity
                style={[taskStyles.taskCard, completed && taskStyles.taskCardCompleted]}
                onPress={() => onEdit(task)}
                activeOpacity={0.7}
            >
                <View style={taskStyles.taskHeader}>
                    <Text style={taskStyles.taskTitle}>{task.title}</Text>
                    <View style={[taskStyles.taskType, getTypeColor()]}>
                        <Text style={[taskStyles.taskType, getTypeColor()]}>{getTypeLabel()}</Text>
                    </View>
                </View>

                {task.description && (
                    <Text style={taskStyles.taskDescription}>{task.description}</Text>
                )}

                {task.type === 'unit' && (
                    <View style={taskStyles.taskProgress}>
                        <Text style={taskStyles.progressText}>{progressText}</Text>
                        <View style={taskStyles.progressBar}>
                            <View
                                style={[
                                    taskStyles.progressFill,
                                    { width: `${Math.round(progress * 100)}%` }
                                ]}
                            />
                        </View>
                    </View>
                )}

                <View style={taskStyles.taskStreak}>
                    {task.type !== 'unit' && (
                        <Text style={taskStyles.streakText}>{streakText}</Text>
                    )}
                    {completed && (
                        <Text style={taskStyles.completedIndicator}>✓ Completed</Text>
                    )}
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

export default TaskCard;