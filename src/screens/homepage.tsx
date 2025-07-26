import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SwipeListView } from 'react-native-swipe-list-view';
import { collection, query, where, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import CustomPopup from '../components/atoms/CustomPopup';
import TaskItem from '../components/TaskItem';
import TaskSwipeRow from '../components/TaskSwipeRow';

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

const HomeScreen = ({ navigation }: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'pending' | 'today' | 'tomorrow' | 'thisWeek'>('all');

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

  // Update current date
  React.useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateDate();
    // Update date every minute
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tasks from Firebase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tasksData: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksData.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(tasksData);
          // Initial filtering will be handled by the useEffect below
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
        showPopup('error', 'Error', 'Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, []);

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({ visible: true, type, title, message });
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const applyFilter = (filter: 'all' | 'completed' | 'pending' | 'today' | 'tomorrow' | 'thisWeek') => {
    setFilterType(filter);
    setShowFilterDropdown(false);
  };

  // Update filtered tasks when tasks, search query, or filter type changes
  useEffect(() => {
    const getFilteredTasks = () => {
      let filtered = tasks;

      // Apply search filter
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(task => {
          const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesSearch;
        });
      }

      // Apply type filter
      switch (filterType) {
        case 'completed':
          filtered = filtered.filter(task => task.completed);
          break;
        case 'pending':
          filtered = filtered.filter(task => !task.completed);
          break;
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filtered = filtered.filter(task => {
            const taskDate = new Date(task.due);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          });
          break;
        case 'tomorrow':
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          filtered = filtered.filter(task => {
            const taskDate = new Date(task.due);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === tomorrow.getTime();
          });
          break;
        case 'thisWeek':
          const startOfWeek = new Date();
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          filtered = filtered.filter(task => {
            const taskDate = new Date(task.due);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate >= startOfWeek && taskDate < endOfWeek;
          });
          break;
        default:
          // 'all' - no additional filtering
          break;
      }

      // Filter out past due tasks for non-specific filters
      if (filterType === 'all' || filterType === 'completed' || filterType === 'pending') {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(task => {
          const taskDueDate = new Date(task.due);
          taskDueDate.setHours(0, 0, 0, 0);
          return taskDueDate >= currentDate;
        });
      }

      return filtered;
    };

    const filtered = getFilteredTasks();
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, filterType]);

  const toggleTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await updateDoc(taskRef, { completed: !task.completed });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showPopup('error', 'Error', 'Failed to update task');
    }
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('AddTask', { task });
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tasks', taskId));
              showPopup('success', 'Success', 'Task deleted successfully');
            } catch (error) {
              console.error('Error deleting task:', error);
              showPopup('error', 'Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getTasksBySection = (section: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    return filteredTasks.filter(task => {
      const taskDueDate = new Date(task.due);
      taskDueDate.setHours(0, 0, 0, 0);
      
      switch (section) {
        case 'today':
          return taskDueDate.getTime() === today.getTime();
        case 'tomorrow':
          return taskDueDate.getTime() === tomorrow.getTime();
        case 'thisWeek':
          return taskDueDate > tomorrow && taskDueDate <= endOfWeek;
        default:
          return false;
      }
    });
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem task={item} onToggle={toggleTask} />
  );

  const renderHiddenItem = ({ item }: { item: Task }) => (
    <TaskSwipeRow task={item} onEdit={handleEditTask} onDelete={handleDeleteTask} />
  );

  const renderSection = (section: string, title: string) => {
    const sectionTasks = getTasksBySection(section);
    if (sectionTasks.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <SwipeListView
          data={sectionTasks}
          renderItem={renderTaskItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          disableRightSwipe
          closeOnRowPress={true}
          closeOnScroll={true}
          previewOpenValue={0}
          previewOpenDelay={0}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7A73E8" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.circularIconContainer}>
            <TouchableOpacity style={styles.menuButton}>
              <Icon name="th-large" size={20} color="#7A73E8" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="times" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.circularIconContainer}>
            <TouchableOpacity style={styles.moreButton} onPress={toggleFilterDropdown}>
              <Icon name="ellipsis-h" size={20} color="#7A73E8" />
            </TouchableOpacity>
            {showFilterDropdown && (
              <View style={styles.filterDropdown}>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'all' && styles.filterOptionActive]}
                  onPress={() => applyFilter('all')}
                >
                  <Icon name="list" size={16} color={filterType === 'all' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'all' && styles.filterOptionTextActive]}>
                    All Tasks
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'completed' && styles.filterOptionActive]}
                  onPress={() => applyFilter('completed')}
                >
                  <Icon name="check-circle" size={16} color={filterType === 'completed' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'completed' && styles.filterOptionTextActive]}>
                    Completed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'pending' && styles.filterOptionActive]}
                  onPress={() => applyFilter('pending')}
                >
                  <Icon name="clock-o" size={16} color={filterType === 'pending' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'pending' && styles.filterOptionTextActive]}>
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'today' && styles.filterOptionActive]}
                  onPress={() => applyFilter('today')}
                >
                  <Icon name="calendar" size={16} color={filterType === 'today' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'today' && styles.filterOptionTextActive]}>
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'tomorrow' && styles.filterOptionActive]}
                  onPress={() => applyFilter('tomorrow')}
                >
                  <Icon name="calendar-o" size={16} color={filterType === 'tomorrow' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'tomorrow' && styles.filterOptionTextActive]}>
                    Tomorrow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterOption, filterType === 'thisWeek' && styles.filterOptionActive]}
                  onPress={() => applyFilter('thisWeek')}
                >
                  <Icon name="calendar-check-o" size={16} color={filterType === 'thisWeek' ? '#7A73E8' : '#666'} />
                  <Text style={[styles.filterOptionText, filterType === 'thisWeek' && styles.filterOptionTextActive]}>
                    This Week
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>My tasks</Text>
            {filterType !== 'all' && (
              <View style={styles.filterIndicator}>
                <Icon name="filter" size={12} color="#fff" />
                <Text style={styles.filterIndicatorText}>
                  {filterType === 'completed' ? 'Completed' : 
                   filterType === 'pending' ? 'Pending' : 
                   filterType === 'today' ? 'Today' : 
                   filterType === 'tomorrow' ? 'Tomorrow' : 'This Week'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={1} 
        onPress={() => showFilterDropdown && setShowFilterDropdown(false)}
      >
        <ScrollView showsVerticalScrollIndicator={true}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="spinner" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>Loading tasks...</Text>
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="tasks" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No tasks found' : filterType !== 'all' ? `No ${filterType} tasks` : 'No tasks yet'}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : filterType !== 'all' 
                    ? `No ${filterType} tasks available`
                    : 'Tap the + button to add your first task'
                }
              </Text>
            </View>
          ) : (
            <>
              {filterType === 'all' ? (
                <>
                  {renderSection('today', 'Today')}
                  {renderSection('tomorrow', 'Tomorrow')}
                  {renderSection('thisWeek', 'This week')}
                </>
              ) : (
                <View style={styles.filteredTasksList}>
                  <SwipeListView
                    data={filteredTasks}
                    renderItem={renderTaskItem}
                    renderHiddenItem={renderHiddenItem}
                    rightOpenValue={-150}
                    disableRightSwipe
                    closeOnRowPress={true}
                    closeOnScroll={true}
                    previewOpenValue={0}
                    previewOpenDelay={0}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
      </TouchableOpacity>

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
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    marginBottom: 30,
  },
  circularIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: 0,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
    paddingVertical: 0,
  },
  moreButton: {
    padding: 0,
  },
  headerInfo: {
    marginLeft: 10,
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  titleText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  filterIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 1,
  },
  completedTask: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7A73E8',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  completedIndicator: {
    borderColor: '#7A73E8',
    backgroundColor: '#7A73E8',
  },
  completedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
    opacity: 0.6,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: 120,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 2,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Swipe styles
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderRadius: 12,
  },
  backRightBtnLeft: {
    backgroundColor: '#007AFF',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF3B30',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  filterDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 140,
    maxWidth: 160,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterOptionActive: {
    backgroundColor: '#f8f9ff',
  },
  filterOptionText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#7A73E8',
    fontWeight: '600',
  },
  filteredTasksList: {
    marginTop: 20,
  },
});

export default HomeScreen;