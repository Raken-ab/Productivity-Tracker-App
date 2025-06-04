import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEvents } from '../utilities/EventContext';
import { loadTasks } from '../utilities/storage';
import { Task } from '../utilities/taskHelpers';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const ReportScreen: React.FC = () => {
    const { state: eventState } = useEvents();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Load tasks from AsyncStorage
    useEffect(() => {
        (async () => {
            const loaded = await loadTasks();
            setTasks(loaded);
            setLoading(false);
        })();
    }, []);

    // Get upcoming events (sorted by soonest)
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return eventState.events
            .filter(e => {
                if (e.isAllDay) {
                    // All day event: compare date only
                    return new Date(e.date) >= new Date(now.toDateString());
                }
                // Timed event: compare date and time
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
    }, [eventState.events]);

    // Get task stats
    const completedTasks = tasks.filter(
        t => t.completed || (t.type === 'unit' && (t.currentValue || 0) >= (t.targetValue || 1))
    );
    const incompleteTasks = tasks.filter(
        t => !t.completed && (t.type !== 'unit' || (t.currentValue || 0) < (t.targetValue || 1))
    );

    // Get streaks for "clean" and "daily" tasks
    const streaks = tasks
        .filter(t => t.type === 'clean' || t.type === 'daily')
        .map(t => ({
            id: t.id,
            title: t.title,
            type: t.type,
            streak: t.streak || 0,
        }))
        .sort((a, b) => b.streak - a.streak);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={styles.header}>Upcoming Events</Text>
            {upcomingEvents.length === 0 ? (
                <View style={styles.emptySection}>
                    <Ionicons name="calendar-outline" size={36} color={colors.primary} />
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
                                {'  '}
                                <Text style={styles.eventDate}>
                                    {new Date(item.date).toLocaleDateString()}
                                </Text>
                            </Text>
                            {item.description ? (
                                <Text style={styles.eventDesc}>{item.description}</Text>
                            ) : null}
                        </View>
                    </View>
                ))
            )}

            <Text style={styles.header}>Task Completion</Text>
            <View style={styles.statsRow}>
                <View style={styles.statsBox}>
                    <Text style={styles.statsNum}>{completedTasks.length}</Text>
                    <Text style={styles.statsLabel}>Completed</Text>
                </View>
                <View style={styles.statsBox}>
                    <Text style={styles.statsNum}>{incompleteTasks.length}</Text>
                    <Text style={styles.statsLabel}>Incomplete</Text>
                </View>
                <View style={styles.statsBox}>
                    <Text style={styles.statsNum}>{tasks.length}</Text>
                    <Text style={styles.statsLabel}>Total</Text>
                </View>
            </View>

            <Text style={styles.header}>Top Streaks</Text>
            {streaks.length === 0 ? (
                <View style={styles.emptySection}>
                    <Ionicons name="flame-outline" size={36} color={colors.primary} />
                    <Text style={styles.emptyText}>No streaks yet</Text>
                </View>
            ) : (
                streaks.slice(0, 5).map(item => (
                    <View style={styles.streakCard} key={item.id}>
                        <Ionicons
                            name={item.type === 'clean' ? 'flame' : 'checkmark-circle'}
                            size={24}
                            color={item.type === 'clean' ? '#FF3B30' : colors.primary}
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.streakTitle}>{item.title}</Text>
                        <Text style={styles.streakNum}>{item.streak} days</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 18,
        marginBottom: 10,
    },
    emptySection: {
        alignItems: 'center',
        marginVertical: 18,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 8,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#232323',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    eventDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
        marginTop: 5,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    eventTime: {
        fontSize: 14,
        color: colors.primary,
        marginTop: 2,
    },
    eventDate: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    eventDesc: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 18,
    },
    statsBox: {
        alignItems: 'center',
        flex: 1,
    },
    statsNum: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statsLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#232323',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    streakTitle: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    streakNum: {
        fontSize: 15,
        color: colors.primary,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default ReportScreen;