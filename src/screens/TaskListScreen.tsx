import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

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

interface TaskListScreenProps {
  navigation: any;
  route: {
    params: {
      type: 'completed' | 'remaining';
      tasks: Task[];
    };
  };
}

const TaskListScreen = ({ navigation, route }: TaskListScreenProps) => {
  const { type, tasks } = route.params;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Personal':
        return '#FF6B35';
      case 'Work':
        return '#FF6B35';
      case 'App':
        return '#FF6B35';
      case 'CF':
        return '#7A73E8';
      case 'Study':
        return '#7A73E8';
      case 'Home':
        return '#4CAF50';
      default:
        return '#FF6B35';
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

  const getTitle = () => {
    return type === 'completed' ? 'Completed Tasks' : 'Remaining Tasks';
  };

  const getIcon = () => {
    return type === 'completed' ? 'check-circle' : 'clock-o';
  };

  const getIconColor = () => {
    return type === 'completed' ? '#4CAF50' : '#FF9800';
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
          <View style={styles.headerInfo}>
            <Icon name={getIcon()} size={24} color={getIconColor()} />
            <Text style={styles.headerTitle}>{getTitle()}</Text>
            <Text style={styles.taskCount}>({tasks.length})</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name={type === 'completed' ? 'check-circle' : 'clock-o'} size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {type === 'completed' ? 'No completed tasks yet' : 'No remaining tasks'}
            </Text>
            <Text style={styles.emptyDescription}>
              {type === 'completed' 
                ? 'Complete some tasks to see them here'
                : 'All your tasks are completed!'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <View style={styles.taskTitleRow}>
                    <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Icon name="info-circle" size={16} color="#7A73E8" style={styles.descriptionIcon} />
                    )}
                  </View>
                  {task.description && (
                    <Text style={[styles.taskDescription, task.completed && styles.completedText]}>
                      {task.description}
                    </Text>
                  )}
                  <Text style={[styles.taskDate, task.completed && styles.completedText]}>
                    Due: {formatDate(task.due)}
                  </Text>
                  <View style={styles.taskTags}>
                    {task.tags.map((tag, index) => (
                      <View key={index} style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.taskStatus}>
                  <Icon 
                    name={task.completed ? 'check-circle' : 'circle-o'} 
                    size={20} 
                    color={task.completed ? '#4CAF50' : '#ccc'} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  headerInfo: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  taskCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
  tasksList: {
    marginBottom: 30,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
    fontWeight: '500',
    marginBottom: 8,
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
  taskStatus: {
    marginLeft: 15,
  },
});

export default TaskListScreen; 