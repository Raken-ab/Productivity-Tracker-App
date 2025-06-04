import React, { useMemo, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useEvents } from '../utilities/EventContext';
import { loadTasks } from '../utilities/storage';
import { Task } from '../utilities/taskHelpers';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const ReportScreen: React.FC = () => {
    const { state: eventState } = useEvents();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const loaded = await loadTasks();
            setTasks(loaded);
            setLoading(false);
        })();
    }, []);

    const now = new Date();

    const upcomingEvents = useMemo(() => {
        return eventState.events
            .filter(e => {
                if (e.isAllDay) {
                    return new Date(e.date) >= new Date(now.toDateString());
                }
                const eventDateTime = new Date(`${e.date}T${e.startTime.length === 5 ? e.startTime + ':00' : e.startTime}`);
                return eventDateTime >= now;
            })
            .sort((a, b) => {
                const aTime = a.isAllDay
                    ? new Date(a.date).getTime()
                    : new Date(`${a.date}T${a.startTime.length === 5 ? a.startTime + ':00' : a.startTime}`).getTime();
                const bTime = b.isAllDay
                    ? new Date(b.date).getTime()
                    : new Date(`${b.date}T${b.startTime.length === 5 ? b.startTime + ':00' : b.startTime}`).getTime();
                return aTime - bTime;
            });
    }, [eventState.events, now]);

    const completedTasks = tasks.filter(
        t => t.completed || (t.type === 'unit' && (t.currentValue || 0) >= (t.targetValue || 1))
    );
    const incompleteTasks = tasks.filter(
        t => !t.completed && (t.type !== 'unit' || (t.currentValue || 0) < (t.targetValue || 1))
    );

    const streaks = tasks
        .filter(t => t.type === 'clean' || t.type === 'daily')
        .map(t => ({
            id: t.id,
            title: t.title,
            type: t.type,
            streak: t.streak || 0,
        }))
        .sort((a, b) => b.streak - a.streak);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading report...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Productivity Report</Text>
                    <View style={styles.headerDivider} />
                    <Text style={styles.headerSubtitle}>
                        Your daily progress at a glance
                    </Text>
                </View>

                {/* Stats Overview */}
                <View style={styles.overviewContainer}>
                    <View style={styles.overviewCard}>
                        <Ionicons name="calendar" size={20} color="#FF9500" />
                        <Text style={styles.overviewNumber}>{upcomingEvents.length}</Text>
                        <Text style={styles.overviewLabel}>Events</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="checkmark-done" size={20} color="#34C759" />
                        <Text style={styles.overviewNumber}>{completedTasks.length}</Text>
                        <Text style={styles.overviewLabel}>Done</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="flame" size={20} color="#FF3B30" />
                        <Text style={styles.overviewNumber}>{streaks.length > 0 ? streaks[0].streak : 0}</Text>
                        <Text style={styles.overviewLabel}>Top Streak</Text>
                    </View>
                </View>

                {/* Upcoming Events */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionHeader}>Upcoming Events</Text>
                    </View>
                    {upcomingEvents.length === 0 ? (
                        <View style={styles.emptySection}>
                            <Ionicons name="calendar-outline" size={48} color={colors.primary} opacity={0.5} />
                            <Text style={styles.emptyText}>No upcoming events</Text>
                        </View>
                    ) : (
                        upcomingEvents.slice(0, 5).map(item => (
                            <View style={styles.eventCard} key={item.id}>
                                <View style={[styles.eventDot, { backgroundColor: item.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.eventTitle}>{item.title}</Text>
                                    <Text style={styles.eventTime}>
                                        {item.isAllDay
                                            ? 'All Day'
                                            : `${item.startTime} - ${item.endTime || ''}`}
                                    </Text>
                                    <Text style={styles.eventDate}>
                                        {new Date(item.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    {item.description ? (
                                        <Text style={styles.eventDesc}>{item.description}</Text>
                                    ) : null}
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#666"
                                    style={{ alignSelf: 'center' }}
                                />
                            </View>
                        ))
                    )}
                </View>

                {/* Task Completion */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                        <Ionicons name="pie-chart-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionHeader}>Task Completion</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={[styles.statsBox, styles.completedBox]}>
                            <Text style={styles.statsNum}>{completedTasks.length}</Text>
                            <Text style={styles.statsLabel}>Completed</Text>
                        </View>
                        <View style={[styles.statsBox, styles.incompleteBox]}>
                            <Text style={styles.statsNum}>{incompleteTasks.length}</Text>
                            <Text style={styles.statsLabel}>Incomplete</Text>
                        </View>
                    </View>
                    <View style={styles.totalTasksBox}>
                        <Text style={styles.totalTasksText}>Total Tasks: {tasks.length}</Text>
                    </View>
                </View>

                {/* Top Streaks */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                        <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionHeader}>Top Streaks</Text>
                    </View>
                    {streaks.length === 0 ? (
                        <View style={styles.emptySection}>
                            <Ionicons name="flame-outline" size={48} color={colors.primary} opacity={0.5} />
                            <Text style={styles.emptyText}>No streaks yet</Text>
                        </View>
                    ) : (
                        streaks.slice(0, 5).map(item => (
                            <View style={styles.streakCard} key={item.id}>
                                <View style={styles.streakIconContainer}>
                                    <Ionicons
                                        name={item.type === 'clean' ? 'flame' : 'checkmark-circle'}
                                        size={20}
                                        color={item.type === 'clean' ? '#FF3B30' : colors.primary}
                                    />
                                </View>
                                <View style={styles.streakTextContainer}>
                                    <Text style={styles.streakTitle}>{item.title}</Text>
                                    <Text style={styles.streakSubtitle}>{item.type === 'clean' ? 'Cleaning' : 'Daily'} streak</Text>
                                </View>
                                <View style={styles.streakBadge}>
                                    <Text style={styles.streakNum}>{item.streak}</Text>
                                    <Text style={styles.streakDays}>days</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#666',
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: 0.5,
    },
    headerDivider: {
        height: 4,
        width: 40,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginVertical: 12,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
    },
    overviewContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 24,
        marginBottom: 16,
    },
    overviewCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '30%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overviewNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
        marginVertical: 8,
    },
    overviewLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginLeft: 8,
    },
    emptySection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 12,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    eventDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
        marginTop: 4,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    eventTime: {
        fontSize: 14,
        color: colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    eventDate: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    eventDesc: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statsBox: {
        alignItems: 'center',
        borderRadius: 12,
        padding: 20,
        width: '48%',
    },
    completedBox: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    incompleteBox: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    statsNum: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    statsLabel: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        fontWeight: '600',
    },
    totalTasksBox: {
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    totalTasksText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 14,
    },
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    streakIconContainer: {
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        borderRadius: 8,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    streakTextContainer: {
        flex: 1,
    },
    streakTitle: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    streakSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    streakBadge: {
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
    },
    streakNum: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '800',
    },
    streakDays: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
        marginTop: -2,
    },
});

export default ReportScreen;