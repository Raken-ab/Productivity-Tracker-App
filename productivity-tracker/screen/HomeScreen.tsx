import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Task, completeTask } from '../utilities/taskHelpers';
import { loadTasks, saveTask, deleteTask } from '../utilities/storage';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

// =======================
// Main HomeScreen Component
// =======================
const HomeScreen: React.FC = () => {
    // ========== State ==========
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // ========== Load Tasks from Storage ==========
    const loadTasksData = useCallback(async () => {
        try {
            const loadedTasks = await loadTasks();
            setTasks(loadedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            Alert.alert('Error', 'Failed to load tasks. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== Initial Load ==========
    useEffect(() => {
        loadTasksData();
    }, [loadTasksData]);

    // ========== Pull-to-Refresh Handler ==========
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTasksData();
        setRefreshing(false);
    }, [loadTasksData]);

    // ========== Mark Task as Complete ==========
    const handleTaskComplete = useCallback(async (task: Task) => {
        try {
            const completedTask = completeTask(task);
            const updatedTasks = await saveTask(completedTask, tasks);
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error completing task:', error);
            Alert.alert('Error', 'Failed to complete task. Please try again.');
        }
    }, [tasks]);

    // ========== Edit Task (open modal) ==========
    const handleTaskEdit = useCallback((task: Task) => {
        setSelectedTask(task);
        setModalVisible(true);
    }, []);

    // ========== Save Task (add or update) ==========
    const handleTaskSave = useCallback(async (task: Task) => {
        try {
            const updatedTasks = await saveTask(task, tasks);
            setTasks(updatedTasks);
            setModalVisible(false);
            setSelectedTask(undefined);
        } catch (error) {
            console.error('Error saving task:', error);
            Alert.alert('Error', 'Failed to save task. Please try again.');
        }
    }, [tasks]);

    // ========== Delete Task ==========
    const handleTaskDelete = useCallback(async (taskId: string) => {
        try {
            const updatedTasks = await deleteTask(taskId, tasks);
            setTasks(updatedTasks);
            setModalVisible(false);
            setSelectedTask(undefined);
        } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert('Error', 'Failed to delete task. Please try again.');
        }
    }, [tasks]);

    // ========== Add New Task (open modal) ==========
    const handleAddTask = useCallback(() => {
        setSelectedTask(undefined);
        setModalVisible(true);
    }, []);

    // ========== Cancel Modal ==========
    const handleModalCancel = useCallback(() => {
        setModalVisible(false);
        setSelectedTask(undefined);
    }, []);

    // ========== Render Each Task Card ==========
    const renderTask = useCallback(({ item }: { item: Task }) => (
        <TaskCard
            task={item}
            onEdit={handleTaskEdit}
            onComplete={handleTaskComplete}
        />
    ), [handleTaskEdit, handleTaskComplete]);

    // ========== Render Empty State ==========
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="cloud-outline" size={48} color={colors.fab} style={{ marginBottom: 12, opacity: 0.7 }} />
            <Text style={styles.emptyStateTitle}>No tasks yet</Text>
            <Text style={styles.emptyStateDescription}>
                Tap the <Text style={{ color: colors.fab, fontWeight: 'bold' }}>+</Text> button to add your first task
            </Text>
        </View>
    );

    // ========== Task Completion Stats ==========
    const getTaskStats = () => {
        const completed = tasks.filter(task => task.completed || (task.type === 'unit' && (task.currentValue || 0) >= (task.targetValue || 1))).length;
        const total = tasks.length;
        return { completed, total };
    };

    const stats = getTaskStats();

    // ========== Loading State ==========
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <View style={styles.glowPurple} />
                    <Ionicons name="hourglass-outline" size={48} color={colors.fab} style={{ marginBottom: 16, opacity: 0.7 }} />
                    <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ========== Main Render ==========
    return (
        <SafeAreaView style={styles.container}>
            {/* Purple glow background effect */}
            <View style={styles.glowPurple} pointerEvents="none" />

            {/* Header with title and stats */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Daily Tasks</Text>
                <Text style={styles.headerStats}>
                    {stats.completed} of {stats.total} completed
                </Text>
            </View>

            {/* Task List */}
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                contentContainerStyle={[
                    styles.listContainer,
                    tasks.length === 0 && styles.listContainerEmpty
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />

            {/* Floating Action Button to Add Task */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddTask}
                activeOpacity={0.8}
                accessibilityLabel="Add new task"
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Modal for Adding/Editing Task */}
            <TaskModal
                visible={modalVisible}
                task={selectedTask}
                onSave={handleTaskSave}
                onDelete={handleTaskDelete}
                onCancel={handleModalCancel}
            />
        </SafeAreaView>
    );
};

// =======================
// Styles (edit colors, spacing, etc. here)
// =======================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    glowPurple: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: colors.fab,
        opacity: 0.13,
        zIndex: 0,
        shadowColor: colors.fab,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
        textShadowColor: colors.fab,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 14,
        letterSpacing: 0.5,
    },
    headerStats: {
        fontSize: 16,
        color: colors.textSecondary,
        textShadowColor: colors.fab,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
        letterSpacing: 0.2,
    },
    listContainer: {
        paddingBottom: 120,
        zIndex: 1,
    },
    listContainerEmpty: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        textShadowColor: colors.fab,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
        letterSpacing: 0.3,
    },
    emptyStateDescription: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        textShadowColor: colors.fab,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
        letterSpacing: 0.2,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: colors.fab,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.fab,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 8, // match event button shadow
        elevation: 10,
        zIndex: 10,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    },
});

export default HomeScreen;