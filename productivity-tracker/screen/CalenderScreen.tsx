import React, { useState, useMemo } from 'react';
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
    Button,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

// Event type definition
interface Event {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    color: string;
    date: string; // yyyy-mm-dd format to match calendar dates
}

const sampleEvents: Event[] = [
    {
        id: '1',
        title: 'Team Meeting',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        description: 'Discuss project updates',
        color: '#1E90FF',
        date: '2024-06-12',
    },
    {
        id: '2',
        title: 'Project Deadline',
        startTime: 'All Day',
        endTime: '',
        description: 'Final submission of project',
        color: '#FF4500',
        date: '2024-06-15',
    },
    {
        id: '3',
        title: 'Lunch with Sarah',
        startTime: '1:00 PM',
        endTime: '2:00 PM',
        description: 'Catch up over lunch',
        color: '#32CD32',
        date: '2024-06-12',
    },
    {
        id: '4',
        title: 'Workout',
        startTime: '6:00 PM',
        endTime: '7:00 PM',
        description: 'Evening gym session',
        color: '#4169E1',
        date: '2024-06-13',
    },
];

// Define CalendarViewMode type
type CalendarViewMode = 'month' | 'week' | '3day';

// Helper function to get week days (Sunday to Saturday) for a given date
function getWeekDays(dateString: string): string[] {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

const CalenderScreen: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
    const [modalVisible, setModalVisible] = useState(false);
    const [newEvent, setNewEvent] = useState<Event>({
        id: '',
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        color: '#1E90FF',
        date: selectedDate,
    });

    const eventsForSelectedDate = useMemo(() =>
        sampleEvents.filter((event) => event.date === selectedDate)
        , [selectedDate]);

    const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

    // Helper function to get three consecutive days (centered on selectedDate)
    function getThreeDays(dateString: string): string[] {
        const date = new Date(dateString);
        return [-1, 0, 1].map(offset => {
            const d = new Date(date);
            d.setDate(date.getDate() + offset);
            return d.toISOString().split('T')[0];
        });
    }

    const threeDays = useMemo(() => getThreeDays(selectedDate), [selectedDate]);

    const onDayPress = (day: string) => {
        setSelectedDate(day);
        setNewEvent({ ...newEvent, date: day }); // Update new event date
    };

    const renderEventItem = ({ item }: { item: Event }) => (
        <View style={styles.eventItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
        </View>
    );

    const onAddEventPress = () => {
        setModalVisible(true);
    };

    const handleAddEvent = () => {
        if (newEvent.title && newEvent.startTime && newEvent.endTime) {
            const newEventWithId = { ...newEvent, id: (sampleEvents.length + 1).toString() };
            sampleEvents.push(newEventWithId);
            setModalVisible(false);
            setNewEvent({ id: '', title: '', startTime: '', endTime: '', description: '', color: '#1E90FF', date: selectedDate });
        } else {
            alert('Please fill in all fields');
        }
    };

    // Prepare marked dates for month view
    const markedDatesMonthView = useMemo(() => {
        const marks: { [date: string]: any } = {};
        sampleEvents.forEach(event => {
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
    }, [selectedDate]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Calendar Heading */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calender</Text>
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
                            const eventColors = sampleEvents
                                .filter((e) => e.date === day)
                                .map((e) => e.color);

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.weekDayContainer, isSelected && styles.selectedDayContainer]}
                                    onPress={() => onDayPress(day)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.weekDayText, isSelected && styles.selectedDayText]}>
                                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                                    </Text>
                                    <Text style={[styles.weekDayNum, isSelected && styles.selectedDayText]}>
                                        {dayNum}
                                    </Text>
                                    <View style={styles.dotRow}>
                                        {eventColors.slice(0, 3).map((color, idx) => (
                                            <View
                                                key={idx}
                                                style={[styles.eventDotSmall, { backgroundColor: color }]}
                                            />
                                        ))}
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
                            const dayEvents = sampleEvents.filter((e) => e.date === day);
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.threeDayContainer, isSelected && styles.selectedDayContainer]}
                                    onPress={() => onDayPress(day)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.threeDayWeekday, isSelected && styles.selectedDayText]}>
                                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                                    </Text>
                                    <Text style={[styles.threeDayNum, isSelected && styles.selectedDayText]}>
                                        {dayNum}
                                    </Text>
                                    <View style={styles.threeDayEventsPreview}>
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <View key={event.id} style={[styles.eventColorBar, { backgroundColor: event.color }]} />
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

            {/* Events list below the calendar */}
            <View style={styles.eventsContainer}>
                <Text style={styles.eventsHeader}>Events for {selectedDate}</Text>
                {eventsForSelectedDate.length === 0 ? (
                    <Text style={styles.noEventsText}>No events for this day.</Text>
                ) : (
                    <FlatList
                        data={eventsForSelectedDate}
                        renderItem={renderEventItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.eventList}
                    />
                )}
            </View>

            {/* Floating Action Button (FAB) for adding event */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onAddEventPress}
                activeOpacity={0.7}
                accessibilityLabel="Add new event"
            >
                <Ionicons name="add" size={32} color="#ffffff" />
            </TouchableOpacity>

            {/* Modal for adding new event */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Event</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Event Title"
                            value={newEvent.title}
                            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Start Time (e.g., 10:00 AM)"
                            value={newEvent.startTime}
                            onChangeText={(text) => setNewEvent({ ...newEvent, startTime: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="End Time (e.g., 11:00 AM)"
                            value={newEvent.endTime}
                            onChangeText={(text) => setNewEvent({ ...newEvent, endTime: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={newEvent.description}
                            onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                        />
                        <View style={styles.colorPickerContainer}>
                            {['#1E90FF', '#FF4500', '#32CD32', '#4169E1'].map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorPicker, { backgroundColor: color }]}
                                    onPress={() => setNewEvent({ ...newEvent, color })}
                                />
                            ))}
                        </View>
                        <Button title="Add Event" onPress={handleAddEvent} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} color="#FF0000" />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
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
        paddingVertical: 100, // Increased height
        borderRadius: 8,
    },
    selectedDayContainer: {
        backgroundColor: '#1E90FF',
        shadowColor: '#1E90FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 7,
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
    },
    eventDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 1,
    },
    threeDayScroll: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    threeDayContainer: {
        width: '64%', // Stretch to full width
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
        fontSize: 14,
        fontWeight: '600',
    },
    eventsContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    eventsHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E90FF',
        marginBottom: 12,
    },
    noEventsText: {
        fontSize: 16,
        color: '#888',
        fontStyle: 'italic',
    },
    eventList: {
        paddingBottom: 80, // space for FAB
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
        marginTop: 6,
    },
    eventTextContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    eventTime: {
        fontSize: 14,
        color: '#bbb',
        marginBottom: 2,
    },
    eventDescription: {
        fontSize: 13,
        color: '#aaa',
        fontStyle: 'italic',
        marginBottom: 2,
    },
    eventItem: {
        flexDirection: 'row',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#222',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 12,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E90FF',
        marginBottom: 16,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: '#1E90FF',
        width: 64,           // Match HomeScreen
        height: 64,          // Match HomeScreen
        borderRadius: 32,    // Match HomeScreen
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E90FF',
        shadowOffset: { width: 0, height: 6 }, // Match HomeScreen
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10,

    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    colorPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    colorPicker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: '#fff',
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
        textShadowColor: '#1E90FF',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 14,
        letterSpacing: 0.5,

    },
});

export default CalenderScreen;
