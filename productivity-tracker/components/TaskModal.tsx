/**
 * TaskModal.tsx
 * -------------
 * Modal component for adding or editing a task in the Productivity Tracker app.
 * Handles form input for task title, description, type, target value, and progress.
 * Provides Save, Cancel, and Delete (if editing) actions.
 * Use this component to display a modal for creating or updating a task.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Task, createTask, updateTaskProgress } from '../utilities/taskHelpers';
import { colors } from '../styles/colors';

interface TaskModalProps {
    visible: boolean;
    task?: Task;
    onSave: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onCancel: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
    visible,
    task,
    onSave,
    onDelete,
    onCancel,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'unit' | 'daily' | 'clean'>('daily');
    const [targetValue, setTargetValue] = useState('');
    const [completed, setCompleted] = useState(false);
    const [unitMode, setUnitMode] = useState<'time' | 'custom'>('custom');
    const [stopwatchRunning, setStopwatchRunning] = useState(false);
    const [stopwatchTime, setStopwatchTime] = useState(0); // in seconds
    const [minutesLogged, setMinutesLogged] = useState(0);
    const [currentValue, setCurrentValue] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMinuteRef = useRef(0);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setType(task.type);
            setTargetValue(task.targetValue?.toString() || '');
            setCompleted(!!task.completed);
            setUnitMode('custom');
            setStopwatchTime(0);
            setStopwatchRunning(false);
            setMinutesLogged(task.currentValue || 0);
            setCurrentValue(task.currentValue?.toString() || '0');
            lastMinuteRef.current = 0;
        } else {
            resetForm();
        }
    }, [task, visible]);

    useEffect(() => {
        if (stopwatchRunning) {
            intervalRef.current = setInterval(() => {
                setStopwatchTime((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [stopwatchRunning]);

    // Increment minutesLogged every time a new minute is crossed on the stopwatch
    useEffect(() => {
        if (unitMode === 'time' && stopwatchRunning) {
            const minutes = Math.floor(stopwatchTime / 60);
            if (minutes > lastMinuteRef.current) {
                setMinutesLogged((prev) => {
                    const max = parseInt(targetValue) || 100;
                    return Math.min(prev + (minutes - lastMinuteRef.current), max);
                });
                lastMinuteRef.current = minutes;
            }
        }
    }, [stopwatchTime, unitMode, stopwatchRunning, targetValue]);

    // When switching to time mode or resetting, also reset lastMinuteRef
    useEffect(() => {
        if (!stopwatchRunning) {
            lastMinuteRef.current = Math.floor(stopwatchTime / 60);
        }
    }, [unitMode, stopwatchRunning, stopwatchTime]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('daily');
        setTargetValue('');
        setCompleted(false);
        setUnitMode('custom');
        setStopwatchTime(0);
        setStopwatchRunning(false);
        setMinutesLogged(0);
        setCurrentValue('0');
        lastMinuteRef.current = 0;
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a task title.');
            return;
        }

        if (type === 'unit' && !targetValue.trim()) {
            Alert.alert('Error', 'Please enter a target value for unit tasks.');
            return;
        }

        let savedTask: Task;

        if (task) {
            // Update existing task
            savedTask = {
                ...task,
                title: title.trim(),
                description: description.trim(),
                type,
                targetValue: type === 'unit' ? parseInt(targetValue) || 1 : undefined,
                updatedAt: new Date().toISOString(),
                completed: (type === 'unit') ? task.completed : completed,
            };

            // Update current value if it's a unit task
            if (type === 'unit') {
                const progress = unitMode === 'time' ? minutesLogged : parseInt(currentValue) || 0;
                savedTask = updateTaskProgress(savedTask, progress);
            }
        } else {
            // Create new task
            savedTask = createTask(
                title.trim(),
                type,
                description.trim(),
                type === 'unit' ? parseInt(targetValue) || 1 : undefined
            );
            // Set initial progress if provided
            if (type === 'unit') {
                const progress = unitMode === 'time' ? minutesLogged : parseInt(currentValue) || 0;
                savedTask = updateTaskProgress(savedTask, progress);
            }
            if (type !== 'unit') {
                savedTask.completed = completed;
            }
        }

        onSave(savedTask);
        resetForm();
    };

    const handleDelete = () => {
        if (!task) return;

        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        onDelete?.(task.id);
                        resetForm();
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    // Helper for slider/input sync
    const maxTarget = parseInt(targetValue) || 100;

    // Stopwatch display
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {task ? 'Edit Task' : 'New Task'}
                    </Text>
                    <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                        <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter task title"
                            placeholderTextColor={colors.textMuted}
                            maxLength={100}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter task description (optional)"
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                            maxLength={300}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Type</Text>
                        <View style={styles.typeContainer}>
                            {(['daily', 'unit', 'clean'] as const).map((taskType) => (
                                <TouchableOpacity
                                    key={taskType}
                                    style={[
                                        styles.typeButton,
                                        type === taskType && styles.typeButtonActive
                                    ]}
                                    onPress={() => setType(taskType)}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === taskType && styles.typeButtonTextActive
                                        ]}
                                    >
                                        {taskType.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.typeDescription}>
                            {type === 'unit' && 'Tasks with measurable progress (e.g., study 3 hours)'}
                            {type === 'daily' && 'Tasks done once per day (e.g., no social media)'}
                            {type === 'clean' && 'Sobriety-based tasks (e.g., no alcohol)'}
                        </Text>
                    </View>

                    {/* Incomplete/complete/relapse toggle for daily/clean tasks */}
                    {task && (type === 'daily' || type === 'clean') && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                            onPress={() => setCompleted(!completed)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    !completed && styles.checkboxIncomplete
                                ]}
                            >
                                {completed ? (
                                    <Text style={styles.checkboxText}>✓</Text>
                                ) : null}
                            </View>
                            <Text style={styles.label}>
                                {type === 'clean'
                                    ? completed
                                        ? <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>Mark as Relapsed (Undo)</Text>
                                        : 'Mark as Relapsed'
                                    : completed
                                        ? 'Mark as Incomplete'
                                        : 'Mark as Complete'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {type === 'unit' && (
                        <>
                            {/* Unit mode selector */}
                            <View style={[styles.formGroup, { flexDirection: 'row', gap: 12 }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.unitModeButton,
                                        unitMode === 'time' && styles.unitModeButtonActive,
                                    ]}
                                    onPress={() => setUnitMode('time')}
                                >
                                    <Text
                                        style={[
                                            styles.unitModeButtonText,
                                            unitMode === 'time' && styles.unitModeButtonTextActive,
                                        ]}
                                    >
                                        Time
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.unitModeButton,
                                        unitMode === 'custom' && styles.unitModeButtonActive,
                                    ]}
                                    onPress={() => setUnitMode('custom')}
                                >
                                    <Text
                                        style={[
                                            styles.unitModeButtonText,
                                            unitMode === 'custom' && styles.unitModeButtonTextActive,
                                        ]}
                                    >
                                        Custom Units
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Target Value *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={targetValue}
                                    onChangeText={setTargetValue}
                                    placeholder={unitMode === 'time' ? "Enter target minutes" : "Enter target value"}
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Stopwatch for Time mode */}
                            {unitMode === 'time' && (
                                <View style={[styles.formGroup, { alignItems: 'center' }]}>
                                    <Text
                                        style={{
                                            color: colors.primary,
                                            fontSize: 64, // Bigger timer
                                            fontWeight: 'bold',
                                            marginBottom: 16,
                                            letterSpacing: 2,
                                        }}
                                    >
                                        {formatTime(stopwatchTime)}
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 24 }}>
                                        <TouchableOpacity
                                            style={[
                                                styles.stopwatchButton,
                                                styles.stopwatchButtonLarge, // Larger button
                                                stopwatchRunning && styles.stopwatchButtonActive,
                                            ]}
                                            onPress={() => setStopwatchRunning(!stopwatchRunning)}
                                        >
                                            <Text style={[
                                                styles.stopwatchButtonText,
                                                styles.stopwatchButtonTextLarge, // Larger text
                                                stopwatchRunning && styles.stopwatchButtonTextActive
                                            ]}>
                                                {stopwatchRunning ? 'Pause' : 'Start'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.stopwatchButton, styles.stopwatchButtonLarge]}
                                            onPress={() => {
                                                setStopwatchRunning(false);
                                                setStopwatchTime(0);
                                                lastMinuteRef.current = 0;
                                            }}
                                        >
                                            <Text style={[styles.stopwatchButtonText, styles.stopwatchButtonTextLarge]}>
                                                Reset
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                                        Every minute that passes adds 1 to Minutes Logged below.
                                    </Text>
                                </View>
                            )}

                            {/* Progress slider and input */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {unitMode === 'time' ? 'Minutes Logged' : 'Current Progress'}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Slider
                                        style={{ flex: 1 }}
                                        minimumValue={0}
                                        maximumValue={maxTarget}
                                        step={1}
                                        value={unitMode === 'time' ? minutesLogged : parseInt(currentValue) || 0}
                                        minimumTrackTintColor={colors.primary}
                                        maximumTrackTintColor={colors.border}
                                        thumbTintColor={colors.primary}
                                        onValueChange={val => {
                                            if (unitMode === 'time') {
                                                setMinutesLogged(val);
                                            } else {
                                                setCurrentValue(val.toString());
                                            }
                                        }}
                                    />
                                    <TextInput
                                        style={[styles.input, { width: 60, marginBottom: 0, textAlign: 'center' }]}
                                        value={unitMode === 'time' ? minutesLogged.toString() : currentValue}
                                        onChangeText={text => {
                                            let num = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                                            if (num > maxTarget) num = maxTarget;
                                            if (unitMode === 'time') {
                                                setMinutesLogged(num);
                                            } else {
                                                setCurrentValue(num.toString());
                                            }
                                        }}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                                    {unitMode === 'time'
                                        ? `${minutesLogged} / ${targetValue || 1}`
                                        : `${currentValue} / ${targetValue || 1}`}
                                </Text>
                            </View>
                        </>
                    )}

                    {task && onDelete && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>Delete Task</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingTop: 50,
    },
    headerButton: {
        padding: 8,
    },
    headerButtonText: {
        fontSize: 16,
        color: colors.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    saveButton: {
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    typeButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    typeButtonTextActive: {
        color: colors.textPrimary,
    },
    typeDescription: {
        fontSize: 12,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    deleteButton: {
        backgroundColor: colors.error,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxIncomplete: {
        backgroundColor: colors.surface,
    },
    checkboxText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    unitModeButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    unitModeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    unitModeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    unitModeButtonTextActive: {
        color: colors.textPrimary,
    },
    stopwatchButton: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    stopwatchButtonActive: {
        backgroundColor: colors.primary,
    },
    stopwatchButtonText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    stopwatchButtonTextActive: {
        color: '#fff',
    },
    stopwatchButtonLarge: {
        minWidth: 100,
        minHeight: 48,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopwatchButtonTextLarge: {
        fontSize: 22,
    },
});

export default TaskModal;