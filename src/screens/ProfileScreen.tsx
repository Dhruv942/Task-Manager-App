import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import CustomPopup from '../components/atoms/CustomPopup';

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  due: string;
  completed: boolean;
  tags: string[];
  section: 'today' | 'tomorrow' | 'thisWeek';
  userId: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('');
  const [missedTasks, setMissedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [remainingTasks, setRemainingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
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

  // Extract username from email
  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      const email = user.email;
      const username = email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      const formattedName = username
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setUserName(formattedName);
    }
  }, []);

  // Fetch all tasks and categorize them
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const allTasks: Task[] = [];
          const missedTasksData: Task[] = [];
          const completedTasksData: Task[] = [];
          const remainingTasksData: Task[] = [];
          
          querySnapshot.forEach((doc) => {
            const task = { id: doc.id, ...doc.data() } as Task;
            allTasks.push(task);
            
            const taskDate = new Date(task.due);
            taskDate.setHours(0, 0, 0, 0);
            
            if (task.completed) {
              completedTasksData.push(task);
            } else if (taskDate < today) {
              // Task is from past dates and not completed
              missedTasksData.push(task);
            } else {
              // Task is not completed and due today or in future
              remainingTasksData.push(task);
            }
          });
          
          // Sort missed tasks by due date (oldest first)
          missedTasksData.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
          
          setMissedTasks(missedTasksData);
          setCompletedTasks(completedTasksData);
          setRemainingTasks(remainingTasksData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  const addMissedTask = async (task: Task, date: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Determine the section based on the selected date
      const selectedDateObj = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      
      let section: 'today' | 'tomorrow' | 'thisWeek';
      let dateMessage: string;
      
      if (selectedDateObj.getTime() === today.getTime()) {
        section = 'today';
        dateMessage = 'today';
      } else if (selectedDateObj.getTime() === tomorrow.getTime()) {
        section = 'tomorrow';
        dateMessage = 'tomorrow';
      } else {
        section = 'thisWeek';
        dateMessage = `on ${selectedDateObj.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })}`;
      }

      // Create a new task with the selected date
      const newTask = {
        title: task.title,
        description: task.description,
        date: date,
        due: date,
        completed: false,
        tags: task.tags,
        section,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tasks'), newTask);
      showPopup('success', 'Task Added', `Missed task "${task.title}" has been added to ${dateMessage}'s tasks!`);
    } catch (error) {
      console.error('Error adding missed task:', error);
      showPopup('error', 'Error', 'Failed to add missed task. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7A73E8" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
            <Text style={styles.userDescription}>
              Task Manager • Stay organized and productive
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('TaskList', { type: 'completed', tasks: completedTasks })}
            >
              <Icon name="check-circle" size={30} color="#4CAF50" />
              <Text style={styles.statNumber}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => navigation.navigate('TaskList', { type: 'remaining', tasks: remainingTasks })}
            >
              <Icon name="clock-o" size={30} color="#FF9800" />
              <Text style={styles.statNumber}>{remainingTasks.length}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Missed Tasks Section */}
        <View style={styles.missedTasksSection}>
          <View style={styles.sectionHeader}>
            <Icon name="clock-o" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Missed Tasks</Text>
            <Text style={styles.taskCount}>({missedTasks.length})</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Icon name="spinner" size={30} color="#ccc" />
              <Text style={styles.loadingText}>Loading missed tasks...</Text>
            </View>
          ) : missedTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="check-circle" size={50} color="#4CAF50" />
              <Text style={styles.emptyTitle}>No missed tasks!</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up with your tasks
              </Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {missedTasks.map((task) => (
                <View key={task.id} style={styles.missedTaskItem}>
                  <View style={styles.taskInfo}>
                    <View style={styles.taskTitleRow}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {task.description && (
                        <Icon name="info-circle" size={16} color="#7A73E8" style={styles.descriptionIcon} />
                      )}
                    </View>
                    {task.description && (
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                    <Text style={styles.taskDate}>
                      Due: {formatDate(task.due)}
                    </Text>
                    <View style={styles.taskTags}>
                      {task.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedTask(task);
                      setShowDatePicker(true);
                    }}
                  >
                    <Icon name="plus" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Icon name="times" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Select Date:</Text>
              <View style={styles.calendarContainer}>
                <DateTimePicker
                  mode="single"
                  date={selectedDate.toDate()}
                  onChange={({ date }: { date: DateType }) => setSelectedDate(dayjs(date))}
                  styles={{
                    day: { color: '#333' },
                    day_label: { color: '#333' },
                    today: { borderColor: '#7A73E8', borderWidth: 1 },
                    selected: { backgroundColor: '#7A73E8' },
                    selected_label: { color: 'white' },
                  }}
                />
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  if (selectedTask) {
                    addMissedTask(selectedTask, selectedDate.format('YYYY-MM-DD'));
                  }
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
  },
  userDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  missedTasksSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  taskCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tasksList: {
    gap: 15,
  },
  missedTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionIcon: {
    marginLeft: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: '#7A73E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#7A73E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
});

export default ProfileScreen; 