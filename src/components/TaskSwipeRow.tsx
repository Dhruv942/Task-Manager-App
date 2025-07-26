import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

interface TaskSwipeRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskSwipeRow: React.FC<TaskSwipeRowProps> = ({ task, onEdit, onDelete }) => {
  if (task.completed) {
    // No swipe actions for completed tasks
    return <View style={styles.emptySwipe} />;
  }
  return (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => onEdit(task)}
      >
        <Icon name="edit" size={20} color="#fff" />
        <Text style={styles.backTextWhite}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => onDelete(task.id)}
      >
        <Icon name="trash" size={20} color="#fff" />
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginBottom: 12,
    borderRadius: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderRadius: 15,
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
  emptySwipe: {
    height: 0,
  },
});

export default TaskSwipeRow; 