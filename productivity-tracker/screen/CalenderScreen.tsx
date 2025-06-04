import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles/colors';
import { useEvents, Event } from '../utilities/EventContext';

type CalendarViewMode = 'month' | 'week' | '3day';

const eventColors = ['#1E90FF', '#FF4500', '#32CD32', '#4169E1', '#FF69B4', '#FFA500', '#9370DB', '#20B2AA'];

// Helper function to format date for display
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Helper function to get week days (Sunday to Saturday) for a given date
const getWeekDays = (dateString: string): string[] => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
};

// Helper function to get three consecutive days (centered on selectedDate)
const getThreeDays = (dateString: string): string[] => {
    const date = new Date(dateString);
    return [-1, 0, 1].map(offset => {
        const d = new Date(date);
        d.setDate(date.getDate() + offset);
        return d.toISOString().split('T')[0];
    });
};

const CalendarScreen: React.FC = () => {
    const {
        state,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDate
    } = useEvents();

    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

    const [newEvent, setNewEvent] = useState<{
        title: string;
        startTime: Date;
        endTime: Date;
        description: string;
        color: string;
        date: string;
        isAllDay: boolean;
        reminder: number;
        recurrence: RecurrenceType;
    }>({
        title: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        description: '',
        color: eventColors[0],
        date: selectedDate,
        isAllDay: false,
        reminder: 15, // 15 minutes default
        recurrence: 'none',
    });

    const eventsForSelectedDate = useMemo(() =>
        getEventsForDate(selectedDate).sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            return a.startTime.localeCompare(b.startTime);
        }),
        [selectedDate, state.events]
    );

    const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
    const threeDays = useMemo(() => getThreeDays(selectedDate), [selectedDate]);

    const resetForm = useCallback(() => {
        setNewEvent({
            title: '',
            startTime: new Date(),
            endTime: new Date(Date.now() + 60 * 60 * 1000),
            description: '',
            color: eventColors[0],
            date: selectedDate,
            isAllDay: false,
            reminder: 15,
            recurrence: 'none',
        });
        setEditingEvent(null);
    }, [selectedDate]);

    const onDayPress = useCallback((day: string) => {
        setSelectedDate(day);
        setNewEvent(prev => ({ ...prev, date: day }));
    }, []);

    const onAddEventPress = useCallback(() => {
        resetForm();
        setModalVisible(true);
    }, [resetForm]);

    const onEditEventPress = useCallback((event: Event) => {
        setEditingEvent(event);
        setNewEvent({
            title: event.title,
            startTime: new Date(`${event.date}T${event.startTime}`),
            endTime: new Date(`${event.date}T${event.endTime}`),
            description: event.description,
            color: event.color,
            date: event.date,
            isAllDay: event.isAllDay,
            reminder: event.reminder || 15,
            recurrence: event.recurrence || 'none',
        });
        setModalVisible(true);
    }, []);

    const handleSaveEvent = useCallback(async () => {
        if (!newEvent.title.trim()) {
            Alert.alert('Error', 'Please enter an event title');
            return;
        }

        try {
            const eventData = {
                title: newEvent.title.trim(),
                startTime: newEvent.isAllDay ? 'All Day' : newEvent.startTime.toTimeString().slice(0, 5),
                endTime: newEvent.isAllDay ? '' : newEvent.endTime.toTimeString().slice(0, 5),
                description: newEvent.description.trim(),
                color: newEvent.color,
                date: newEvent.date,
                isAllDay: newEvent.isAllDay,
                reminder: newEvent.reminder,
                recurrence: newEvent.recurrence,
            };

            if (editingEvent) {
                await updateEvent({ ...editingEvent, ...eventData });
            } else {
                await addEvent(eventData);
            }

            setModalVisible(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save event. Please try again.');
        }
    }, [newEvent, editingEvent, addEvent, updateEvent, resetForm]);

    const handleDeleteEvent = useCallback((eventId: string, eventTitle: string) => {
        Alert.alert(
            'Delete Event',
            `Are you sure you want to delete "${eventTitle}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteEvent(eventId);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete event. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [deleteEvent]);

    const renderEventItem = useCallback(({ item }: { item: Event }) => (
        <TouchableOpacity
            style={styles.eventItem}
            onPress={() => onEditEventPress(item)}
            onLongPress={() => handleDeleteEvent(item.id, item.title)}
        >
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>
                    {item.isAllDay ? 'All Day' : `${item.startTime} - ${item.endTime}`}
                </Text>
                {item.description && (
                    <Text style={styles.eventDescription}>{item.description}</Text>
                )}
                {item.recurrence !== 'none' && (
                    <Text style={styles.recurrenceText}>Repeats {item.recurrence}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    ), [onEditEventPress, handleDeleteEvent]);

    // Prepare marked dates for month view
    const markedDatesMonthView = useMemo(() => {
        const marks: { [date: string]: any } = {};
        state.events.forEach(event => {
            if (!marks[event.date]) {
                marks[event.date] = { dots: [] };
            }
            marks[event.date].dots.push({ color: event.color });
        });

        // Highlight selected date
        if (marks[selectedDate]) {
            marks[selectedDate] = {
                ...marks[selectedDate],
                selected: true,
                selectedColor: '#1E90FF',
            };
        } else {
            marks[selectedDate] = {
                selected: true,
                selectedColor: '#1E90FF',
            };
        }
        return marks;
    }, [selectedDate, state.events]);

    const onTimeChange = useCallback((event: any, selectedTime?: Date, isStartTime: boolean = true) => {
        if (isStartTime) {
            setShowStartTimePicker(false);
            if (selectedTime) {
                setNewEvent(prev => ({
                    ...prev,
                    startTime: selectedTime,
                    endTime: prev.endTime < selectedTime ? new Date(selectedTime.getTime() + 60 * 60 * 1000) : prev.endTime
                }));
            }
        } else {
            setShowEndTimePicker(false);
            if (selectedTime) {
                setNewEvent(prev => ({ ...prev, endTime: selectedTime }));
            }
        }
    }, []);

    if (state.loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E90FF" />
                    <Text style={styles.loadingText}>Loading events...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calendar</Text>
                <Text style={styles.headerSubtitle}>
                    {state.events.length} events total
                </Text>
            </View>

            {/* View mode toggle buttons */}
            <View style={styles.viewToggleContainer}>
                {(['month', 'week', '3day'] as CalendarViewMode[]).map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        activeOpacity={0.7}
                        onPress={() => setViewMode(mode)}
                        style={[
                            styles.viewToggleButton,
                            viewMode === mode && styles.viewToggleButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.viewToggleText,
                                viewMode === mode && styles.viewToggleTextActive,
                            ]}
                        >
                            {mode === '3day' ? '3 Day' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Calendar view */}
            <View style={styles.calendarContainer}>
                {viewMode === 'month' && (
                    <Calendar
                        onDayPress={(day) => onDayPress(day.dateString)}
                        markedDates={markedDatesMonthView}
                        markingType={'multi-dot'}
                        theme={{
                            backgroundColor: '#121212',
                            calendarBackground: '#121212',
                            textSectionTitleColor: '#bbbbbb',
                            selectedDayBackgroundColor: '#1E90FF',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#1E90FF',
                            dayTextColor: '#ddd',
                            textDisabledColor: '#555555',
                            monthTextColor: '#1E90FF',
                            arrowColor: '#1E90FF',
                            textDayFontWeight: '600',
                            textMonthFontWeight: '700',
                            textDayHeaderFontWeight: '600',
                            textDayFontSize: 16,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14,
                        }}
                        style={styles.calendar}
                    />
                )}

                {viewMode === 'week' && (
                    <View style={styles.weekRow}>
                        {weekDays.map((day) => {
                            const date = new Date(day);
                            const dayNum = date.getDate();
                            const isSelected = day === selectedDate;
                            const isToday = day === new Date().toISOString().split('T')[0];
                            const dayEvents = state.events.filter((e) => e.date === day);
                            const eventColors = dayEvents.map((e) => e.color);

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.weekDayContainer,
                                        isSelected && styles.selectedDayContainer,
                                        isToday && !isSelected && styles.todayContainer
                                    ]}
                                    onPress={() => onDayPress(day)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.weekDayText,
                                        (isSelected || isToday) && styles.selectedDayText
                                    ]}>
                                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                                    </Text>
                                    <Text style={[
                                        styles.weekDayNum,
                                        (isSelected || isToday) && styles.selectedDayText
                                    ]}>
                                        {dayNum}
                                    </Text>
                                    <View style={styles.dotRow}>
                                        {eventColors.slice(0, 3).map((color, idx) => (
                                            <View
                                                key={idx}
                                                style={[styles.eventDotSmall, { backgroundColor: color }]}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <Text style={styles.moreEventsIndicator}>+{dayEvents.length - 3}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {viewMode === '3day' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.threeDayScroll}>
                        {threeDays.map((day) => {
                            const date = new Date(day);
                            const dayNum = date.getDate();
                            const isSelected = day === selectedDate;
                            const isToday = day === new Date().toISOString().split('T')[0];
                            const dayEvents = state.events.filter((e) => e.date === day);

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.threeDayContainer,
                                        isSelected && styles.selectedDayContainer,
                                        isToday && !isSelected && styles.todayContainer
                                    ]}
                                    onPress={() => onDayPress(day)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        styles.threeDayWeekday,
                                        (isSelected || isToday) && styles.selectedDayText
                                    ]}>
                                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                                    </Text>
                                    <Text style={[
                                        styles.threeDayNum,
                                        (isSelected || isToday) && styles.selectedDayText
                                    ]}>
                                        {dayNum}
                                    </Text>
                                    <View style={styles.threeDayEventsPreview}>
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <View
                                                key={event.id}
                                                style={[styles.eventColorBar, { backgroundColor: event.color }]}
                                            />
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <Text style={styles.moreEventsText}>+{dayEvents.length - 2}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>

            {/* Events list */}
            <View style={styles.eventsContainer}>
                <Text style={styles.eventsHeader}>
                    {formatDate(selectedDate)}
                </Text>
                {eventsForSelectedDate.length === 0 ? (
                    <View style={styles.noEventsContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#666" />
                        <Text style={styles.noEventsText}>No events for this day</Text>
                        <Text style={styles.noEventsSubtext}>Tap the + button to add one</Text>
                    </View>
                ) : (
                    <FlatList
                        data={eventsForSelectedDate}
                        renderItem={renderEventItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.eventList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onAddEventPress}
                activeOpacity={0.7}
                accessibilityLabel="Add new event"
            >
                <Ionicons name="add" size={32} color="#ffffff" />
            </TouchableOpacity>

            {/* Event Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    resetForm();
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {editingEvent ? 'Edit Event' : 'Add New Event'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSaveEvent}
                                style={styles.modalSaveButton}
                            >
                                <Text style={styles.modalSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                            <TextInput
                                style={styles.input}
                                placeholder="Event Title"
                                placeholderTextColor="#666"
                                value={newEvent.title}
                                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                            />

                            <TouchableOpacity
                                style={styles.toggleContainer}
                                onPress={() => setNewEvent({ ...newEvent, isAllDay: !newEvent.isAllDay })}
                            >
                                <Text style={styles.toggleLabel}>All Day</Text>
                                <View style={[styles.toggle, newEvent.isAllDay && styles.toggleActive]}>
                                    <View style={[styles.toggleThumb, newEvent.isAllDay && styles.toggleThumbActive]} />
                                </View>
                            </TouchableOpacity>

                            {!newEvent.isAllDay && (
                                <View style={styles.timeContainer}>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowStartTimePicker(true)}
                                    >
                                        <Text style={styles.timeLabel}>Start Time</Text>
                                        <Text style={styles.timeValue}>
                                            {newEvent.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowEndTimePicker(true)}
                                    >
                                        <Text style={styles.timeLabel}>End Time</Text>
                                        <Text style={styles.timeValue}>
                                            {newEvent.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description (optional)"
                                placeholderTextColor="#666"
                                value={newEvent.description}
                                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={styles.sectionLabel}>Color</Text>
                            <View style={styles.colorPickerContainer}>
                                {eventColors.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorPicker,
                                            { backgroundColor: color },
                                            newEvent.color === color && styles.selectedColorPicker
                                        ]}
                                        onPress={() => setNewEvent({ ...newEvent, color })}
                                    />
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>Reminder</Text>
                            <View style={styles.reminderContainer}>
                                {[5, 15, 30, 60].map(minutes => (
                                    <TouchableOpacity
                                        key={minutes}
                                        style={[
                                            styles.reminderButton,
                                            newEvent.reminder === minutes && styles.selectedReminderButton
                                        ]}
                                        onPress={() => setNewEvent({ ...newEvent, reminder: minutes })}
                                    >
                                        <Text style={[
                                            styles.reminderText,
                                            newEvent.reminder === minutes && styles.selectedReminderText
                                        ]}>
                                            {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>Repeat</Text>
                            <View style={styles.recurrenceContainer}>
                                {(['none', 'daily', 'weekly', 'monthly'] as const).map(recurrence => (
                                    <TouchableOpacity
                                        key={recurrence}
                                        style={[
                                            styles.recurrenceButton,
                                            newEvent.recurrence === recurrence && styles.selectedRecurrenceButton
                                        ]}
                                        onPress={() => setNewEvent({ ...newEvent, recurrence })}
                                    >
                                        <Text style={[
                                            styles.recurrenceText,
                                            newEvent.recurrence === recurrence && styles.selectedRecurrenceText
                                        ]}>
                                            {recurrence === 'none' ? 'Never' : recurrence.charAt(0).toUpperCase() + recurrence.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                {/* Cross-platform time pickers in modal overlays */}
                {showStartTimePicker && (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={showStartTimePicker}
                        onRequestClose={() => setShowStartTimePicker(false)}
                    >
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}
                            activeOpacity={1}
                            onPressOut={() => setShowStartTimePicker(false)}
                        >
                            <View style={{ backgroundColor: '#222', margin: 32, borderRadius: 16, padding: 16 }}>
                                <DateTimePicker
                                    value={newEvent.startTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="spinner"
                                    onChange={(event, selectedTime) => {
                                        setShowStartTimePicker(false);
                                        if (selectedTime) onTimeChange(event, selectedTime, true);
                                    }}
                                    style={{ backgroundColor: '#222' }}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}

                {showEndTimePicker && (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={showEndTimePicker}
                        onRequestClose={() => setShowEndTimePicker(false)}
                    >
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}
                            activeOpacity={1}
                            onPressOut={() => setShowEndTimePicker(false)}
                        >
                            <View style={{ backgroundColor: '#222', margin: 32, borderRadius: 16, padding: 16 }}>
                                <DateTimePicker
                                    value={newEvent.endTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="spinner"
                                    onChange={(event, selectedTime) => {
                                        setShowEndTimePicker(false);
                                        if (selectedTime) onTimeChange(event, selectedTime, false);
                                    }}
                                    style={{ backgroundColor: '#222' }}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}
            </Modal>

            {state.error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{state.error}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
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
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
        textShadowColor: '#1E90FF',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 14,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    calendar: {
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
    },
    calendarContainer: {
        paddingBottom: 8,
    },
    viewToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 12,
        gap: 12,
    },
    viewToggleButton: {
        backgroundColor: '#222222',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    viewToggleButtonActive: {
        backgroundColor: '#1E90FF',
        shadowColor: '#1E90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
    viewToggleText: {
        color: '#999999',
        fontWeight: '600',
        fontSize: 16,
    },
    viewToggleTextActive: {
        color: '#fff',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
    },
    weekDayContainer: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        minHeight: 80,
        justifyContent: 'center',
    },
    selectedDayContainer: {
        backgroundColor: '#1E90FF',
        shadowColor: '#1E90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 7,
    },
    todayContainer: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#1E90FF',
    },
    weekDayText: {
        color: '#bbbbbb',
        fontSize: 14,
        fontWeight: '600',
    },
    weekDayNum: {
        color: '#dddddd',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 2,
    },
    selectedDayText: {
        color: '#fff',
    },
    dotRow: {
        flexDirection: 'row',
        marginTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 1,
    },
    moreEventsIndicator: {
        color: '#666',
        fontSize: 10,
        marginLeft: 2,
    },
    threeDayScroll: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    threeDayContainer: {
        width: 120,
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        marginRight: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.95,
        shadowRadius: 6,
        elevation: 6,
    },
    threeDayWeekday: {
        fontSize: 15,
        color: '#bbbbbb',
        fontWeight: '600',
    },
    threeDayNum: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ddd',
        marginTop: 2,
    },
    threeDayEventsPreview: {
        flexDirection: 'row',
        marginTop: 12,
        alignItems: 'center',
    },
    eventColorBar: {
        width: 20,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 3,
    },
    moreEventsText: {
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
    },
    eventsContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    eventsHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E90FF',
        marginBottom: 12,
    },
    eventList: {
        paddingBottom: 32,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#232323',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    colorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 12,
    },
    eventTextContainer: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    eventTime: {
        fontSize: 13,
        color: '#1E90FF',
        fontWeight: '600',
        marginBottom: 2,
    },
    eventDescription: {
        fontSize: 13,
        color: '#bbb',
        marginBottom: 2,
    },
    recurrenceText: {
        fontSize: 12,
        color: '#FFA500',
        fontWeight: '600',
    },
    noEventsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    noEventsText: {
        fontSize: 18,
        color: '#bbb',
        marginTop: 8,
        fontWeight: '600',
    },
    noEventsSubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: '#1E90FF',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E90FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10,

    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#232323',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    modalCloseButton: {
        padding: 8,
        marginRight: 8,
    },
    modalSaveButton: {
        padding: 8,
        marginLeft: 8,
    },
    modalSaveText: {
        color: '#1E90FF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalScrollView: {
        marginTop: 8,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#444',
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 12,
    },
    toggle: {
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#444',
        justifyContent: 'center',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#1E90FF',
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#bbb',
        alignSelf: 'flex-start',
    },
    toggleThumbActive: {
        backgroundColor: '#fff',
        alignSelf: 'flex-end',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    timeButton: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    timeLabel: {
        color: '#bbb',
        fontSize: 13,
        marginBottom: 2,
    },
    timeValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionLabel: {
        color: '#bbb',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 8,
    },
    colorPickerContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 4,
    },
    colorPicker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorPicker: {
        borderColor: '#fff',
    },
    reminderContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 4,
    },
    reminderButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#444',
    },
    selectedReminderButton: {
        backgroundColor: '#1E90FF',
        borderColor: '#1E90FF',
    },
    reminderText: {
        color: '#bbb',
        fontWeight: '600',
        fontSize: 14,
    },
    selectedReminderText: {
        color: '#fff',
    },
    recurrenceContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 4,
    },
    recurrenceButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#444',
    },
    selectedRecurrenceButton: {
        backgroundColor: '#1E90FF',
        borderColor: '#1E90FF',
    },
    selectedRecurrenceText: {
        color: '#fff',
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        margin: 16,
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default CalendarScreen;