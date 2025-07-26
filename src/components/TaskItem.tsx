import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
}

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'Personal':
    case 'Work':
    case 'App':
      return '#FF6B35';
    case 'CF':
    case 'Study':
      return '#7A73E8';
    case 'Home':
      return '#4CAF50';
    default:
      return '#FF6B35';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => (
  <TouchableOpacity
    style={[styles.taskItem, task.completed && styles.completedTask]}
    onPress={() => onToggle(task.id)}
    activeOpacity={0.9}
    disabled={false}
  >
    <View style={styles.taskLeft}>
      <View style={[styles.taskIndicator, task.completed && styles.completedIndicator]}>
        {task.completed && <View style={styles.completedDot} />}
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={[styles.taskDescription, task.completed && styles.completedText]}>
            {task.description}
          </Text>
        )}
        <Text style={[styles.taskDate, task.completed && styles.completedText]}>
          {new Date(task.due).toLocaleDateString()}
        </Text>
      </View>
    </View>
    <View style={styles.taskTags}>
      {task.tags.map((tag, index) => (
        <View key={index} style={[styles.tag, { backgroundColor: getTagColor(tag) }]}> 
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  completedTask: {
    opacity: 0.6,
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
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
    fontStyle: 'italic',
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
});

export default TaskItem; 