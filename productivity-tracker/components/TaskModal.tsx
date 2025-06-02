import React, { useState, useEffect } from 'react';
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
    const [currentValue, setCurrentValue] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setType(task.type);
            setTargetValue(task.targetValue?.toString() || '');
            setCurrentValue(task.currentValue?.toString() || '');
        } else {
            resetForm();
        }
    }, [task, visible]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('daily');
        setTargetValue('');
        setCurrentValue('');
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
            };

            // Update current value if it's a unit task
            if (type === 'unit' && currentValue.trim()) {
                savedTask = updateTaskProgress(savedTask, parseInt(currentValue) || 0);
            }
        } else {
            // Create new task
            savedTask = createTask(
                title.trim(),
                type,
                description.trim(),
                type === 'unit' ? parseInt(targetValue) || 1 : undefined
            );
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

                    {type === 'unit' && (
                        <>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Target Value *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={targetValue}
                                    onChangeText={setTargetValue}
                                    placeholder="Enter target value"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>

                            {task && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Current Progress</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={currentValue}
                                        onChangeText={setCurrentValue}
                                        placeholder="Enter current value"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
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
});

export default TaskModal;