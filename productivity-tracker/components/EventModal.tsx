import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    TextInput,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles/colors';

interface EventModalProps {
    visible: boolean;
    event?: {
        title: string;
        startTime: string;
        endTime: string;
        description: string;
        color: string;
    };
    onSave: (event: { title: string; startTime: string; endTime: string; description: string; color: string }) => void;
    onCancel: () => void;
}

const COLOR_OPTIONS = ['#1E90FF', '#FF4500', '#32CD32', '#4169E1'];

const EventModal: React.FC<EventModalProps> = ({ visible, event, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(COLOR_OPTIONS[0]);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setStartTime(event.startTime ? parseTimeStringToDate(event.startTime) : null);
            setEndTime(event.endTime ? parseTimeStringToDate(event.endTime) : null);
            setDescription(event.description);
            setColor(event.color || COLOR_OPTIONS[0]);
        } else {
            setTitle('');
            setStartTime(null);
            setEndTime(null);
            setDescription('');
            setColor(COLOR_OPTIONS[0]);
        }
    }, [event, visible]);

    function parseTimeStringToDate(timeStr: string): Date {
        const today = new Date();
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    }

    function formatDateToTimeString(date: Date): string {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();
        return `${hours}:${minutesStr} ${ampm}`;
    }

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            title: title.trim(),
            startTime: startTime ? formatDateToTimeString(startTime) : '',
            endTime: endTime ? formatDateToTimeString(endTime) : '',
            description: description.trim(),
            color,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
            <KeyboardAvoidingView style={styles.overlay} behavior="padding">
                <View style={styles.modal}>
                    <Text style={styles.headerTitle}>{event ? 'Edit Event' : 'New Event'}</Text>
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Event Title"
                                placeholderTextColor={colors.textMuted}
                                maxLength={100}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Time From</Text>
                            <TouchableOpacity style={styles.timeSelector} onPress={() => setShowStartTimePicker(true)}>
                                <Text style={startTime ? styles.timeText : styles.placeholderText}>
                                    {startTime ? formatDateToTimeString(startTime) : 'Select Start Time (optional)'}
                                </Text>
                            </TouchableOpacity>
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
                                                value={startTime || new Date()}
                                                mode="time"
                                                is24Hour={false}
                                                display="spinner"
                                                onChange={(_event, selectedDate) => {
                                                    setShowStartTimePicker(false);
                                                    if (selectedDate) setStartTime(selectedDate);
                                                }}
                                                style={{ backgroundColor: '#222' }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Time To</Text>
                            <TouchableOpacity style={styles.timeSelector} onPress={() => setShowEndTimePicker(true)}>
                                <Text style={endTime ? styles.timeText : styles.placeholderText}>
                                    {endTime ? formatDateToTimeString(endTime) : 'Select End Time (optional)'}
                                </Text>
                            </TouchableOpacity>
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
                                                value={endTime || new Date()}
                                                mode="time"
                                                is24Hour={false}
                                                display="spinner"
                                                onChange={(_event, selectedDate) => {
                                                    setShowEndTimePicker(false);
                                                    if (selectedDate) setEndTime(selectedDate);
                                                }}
                                                style={{ backgroundColor: '#222' }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Description (optional)"
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={3}
                                maxLength={300}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Color</Text>
                            <View style={styles.colorPickerContainer}>
                                {COLOR_OPTIONS.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[
                                            styles.colorPicker,
                                            {
                                                backgroundColor: c,
                                                borderWidth: color === c ? 3 : 1,
                                                borderColor: color === c ? '#fff' : '#888',
                                            },
                                        ]}
                                        onPress={() => setColor(c)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#222',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxHeight: '90%',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 18,
    },
    label: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#444',
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    colorPickerContainer: {
        flexDirection: 'row',
        marginTop: 6,
    },
    colorPicker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 18,
    },
    cancelButton: {
        marginRight: 16,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timeSelector: {
        backgroundColor: '#333',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#444',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#888',
    },
    timeText: {
        color: '#fff',
    },
});

export default EventModal;
