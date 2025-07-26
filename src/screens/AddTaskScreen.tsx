import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import CustomInput from '../components/atoms/input';
import CustomButton from '../components/atoms/Button';
import CustomPopup from '../components/atoms/CustomPopup';

interface TaskForm {
  title: string;
  description: string;
  due: Date;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  tags: string[];
  section: 'today' | 'tomorrow' | 'thisWeek';
}

interface Task {
  id: string;
  title: string;
  description: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  tags: string[];
  section: 'today' | 'tomorrow' | 'thisWeek';
  completed: boolean;
  userId: string;
  createdAt?: any;
}

const AddTaskScreen = ({ navigation, route }: any) => {
  const isEditing = route.params?.task;
  const taskToEdit = route.params?.task as Task | undefined;

  const initialFormState: TaskForm = {
    title: '',
    description: '',
    due: new Date(),
    priority: 'High',
    status: 'Pending',
    tags: [],
    section: 'today',
  };

  const [form, setForm] = useState<TaskForm>(initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [popup, setPopup] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Initialize form with task data if editing
  useEffect(() => {
    if (isEditing && taskToEdit) {
      setForm({
        title: taskToEdit.title,
        description: taskToEdit.description,
        due: new Date(taskToEdit.due),
        priority: taskToEdit.priority,
        status: taskToEdit.status,
        tags: taskToEdit.tags,
        section: taskToEdit.section,
      });
    }
  }, [isEditing, taskToEdit]);

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const getSectionFromDate = (date: Date): 'today' | 'tomorrow' | 'thisWeek' => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    const tomorrowDate = new Date(tomorrow);
    tomorrowDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === todayDate.getTime()) {
      return 'today';
    } else if (taskDate.getTime() === tomorrowDate.getTime()) {
      return 'tomorrow';
    } else {
      return 'thisWeek';
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      return showPopup('error', 'Error', 'Please enter a task title');
    }
    if (!form.description.trim()) {
      return showPopup('error', 'Error', 'Please enter a task description');
    }

    const user = auth.currentUser;
    if (!user) {
      return showPopup('error', 'Error', 'Please log in to add tasks');
    }

    try {
      const section = getSectionFromDate(form.due);
      const taskData = {
        title: form.title,
        description: form.description,
        due: form.due.toISOString(),
        priority: form.priority,
        status: form.status,
        tags: form.tags,
        section,
        userId: user.uid,
        completed: isEditing ? taskToEdit?.completed || false : false,
        createdAt: isEditing ? taskToEdit?.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (isEditing && taskToEdit) {
        // Update existing task
        await updateDoc(doc(db, 'tasks', taskToEdit.id), taskData);
        showPopup('success', 'Success', 'Task updated successfully!');
        setTimeout(() => {
          navigation.navigate('MainTabs', { screen: 'Home' });
        }, 1500);
      } else {
        // Add new task
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        console.log('Task added with ID:', docRef.id);
        showPopup('success', 'Success', 'Task added successfully!');
        
        // Clear form after successful addition
        setForm(initialFormState);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      showPopup('error', 'Error', `Failed to ${isEditing ? 'update' : 'add'} task. Please try again.`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#7A73E8';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FF9800';
      case 'In Progress': return '#2196F3';
      case 'Completed': return '#4CAF50';
      default: return '#7A73E8';
    }
  };

  const handleDateChange = ({ date }: { date: DateType }) => {
    if (date) {
      setForm({ ...form, due: new Date(date.toString()) });
    }
    setShowDatePicker(false);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7A73E8" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Task' : 'Add New Task'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <Text style={styles.label}>Title *</Text>
          <CustomInput
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="Enter task title"
            containerStyle={styles.input}
            inputStyle={styles.inputContent}
          />

          <Text style={styles.label}>Description *</Text>
          <CustomInput
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Describe your task in detail... (e.g., steps to complete, important notes, requirements)"
            containerStyle={styles.input}
            inputStyle={[styles.inputContent, styles.descriptionInput] as any}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {form.description.length}/500 characters
          </Text>

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={showDatePickerModal}
          >
            <Icon name="calendar" size={16} color="#7A73E8" />
            <Text style={styles.dateText}>
              {form.due.toLocaleDateString()}
            </Text>
            <Icon name="chevron-right" size={16} color="#7A73E8" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                mode="single"
                date={form.due}
                onChange={handleDateChange}
                styles={{
                  day: { color: '#333' },
                  day_label: { color: '#333' },
                  today: { borderColor: '#7A73E8', borderWidth: 1 },
                  selected: { backgroundColor: '#7A73E8' },
                  selected_label: { color: 'white' },
                }}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.optionsContainer}>
            {(['High', 'Medium', 'Low'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.optionButton,
                  form.priority === priority && { 
                    backgroundColor: getPriorityColor(priority),
                    borderColor: getPriorityColor(priority)
                  }
                ]}
                onPress={() => setForm({ ...form, priority })}
              >
                <Text style={[
                  styles.optionText,
                  form.priority === priority && styles.selectedOptionText
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.optionsContainer}>
            {(['Pending', 'In Progress', 'Completed'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  form.status === status && { 
                    backgroundColor: getStatusColor(status),
                    borderColor: getStatusColor(status)
                  }
                ]}
                onPress={() => setForm({ ...form, status })}
              >
                <Text style={[
                  styles.optionText,
                  form.status === status && styles.selectedOptionText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {['Personal', 'Work', 'Home', 'Study', 'App', 'CF'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  form.tags.includes(tag) && styles.selectedTag
                ]}
                onPress={() => {
                  const newTags = form.tags.includes(tag)
                    ? form.tags.filter(t => t !== tag)
                    : [...form.tags, tag];
                  setForm({ ...form, tags: newTags });
                }}
              >
                <Text style={[
                  styles.tagText,
                  form.tags.includes(tag) && styles.selectedTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.submitSection}>
          <CustomButton
            title={isEditing ? 'Update Task' : 'Add Task'}
            onPress={handleSubmit}
            containerStyle={styles.submitButton}
          />
        </View>
      </ScrollView>

      <CustomPopup
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={hidePopup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A73E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    marginBottom: 20,
  },
  inputContent: {
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderWidth: 1,
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  descriptionInput: {
    minHeight: 100, // Ensure minimum height for multiline input
    textAlignVertical: 'top', // Align text to the top
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  selectedTag: {
    backgroundColor: '#7A73E8',
    borderColor: '#7A73E8',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  characterCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
});

export default AddTaskScreen; 