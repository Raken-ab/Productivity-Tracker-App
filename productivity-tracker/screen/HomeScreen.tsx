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
} from 'react-native';
// Task card component (swipeable)
import TaskCard from '../components/TaskCard';
// Modal for adding/editing tasks
import TaskModal from '../components/TaskModal';
// Task logic and types
import { Task, completeTask } from '../utilities/taskHelpers';
// AsyncStorage helpers
import { loadTasks, saveTask, deleteTask } from '../utilities/storage';
// Color palette
import { colors } from '../styles/colors';

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
            <Text style={styles.emptyStateTitle}>No tasks yet</Text>
            <Text style={styles.emptyStateDescription}>
                Tap the + button to add your first task
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
                    <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ========== Main Render ==========
    return (
        <SafeAreaView style={styles.container}>
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
            >
                <Text style={styles.fabText}>+</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    headerStats: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    listContainer: {
        paddingBottom: 100,
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
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.fab,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    fabText: {
        fontSize: 24,
        fontWeight: '300',
        color: colors.textPrimary,
    },
});

export default HomeScreen;