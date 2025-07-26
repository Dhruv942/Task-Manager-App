<<<<<<< HEAD
# Task Manager App

A React Native task management application with Firebase integration, featuring task filtering, swipe gestures, and real-time updates.

## Features

### 🔍 Task Filtering & Search
- **Search Bar**: Real-time search functionality with a filter icon on the right side
- **Smart Filtering**: Search by task title or tags
- **Clear Search**: Easy-to-use clear button when search is active

### 📱 Swipe Gestures
- **Right Swipe**: Edit task functionality
- **Left Swipe**: Delete task with confirmation dialog
- **Visual Feedback**: Color-coded swipe actions (blue for edit, red for delete)

### 🔥 Firebase Integration
- **Real-time Sync**: Tasks are fetched from Firebase Firestore in real-time
- **User Authentication**: Tasks are associated with authenticated users
- **CRUD Operations**: Create, read, update, and delete tasks with Firebase

### 📋 Task Management
- **Task Sections**: Automatic categorization into Today, Tomorrow, and This Week
- **Task Status**: Mark tasks as completed/incomplete
- **Priority Levels**: High, Medium, Low priority support
- **Tags**: Categorize tasks with custom tags (Personal, Work, Home, Study, App, CF)

## Technical Implementation

### Search Functionality
- Uses `TextInput` with real-time filtering
- Searches both task titles and tags
- Debounced search for better performance

### Swipe Gestures
- Implemented using `react-native-swipe-list-view`
- Custom swipe actions with visual feedback
- Confirmation dialogs for destructive actions

### Firebase Integration
- Real-time listeners using `onSnapshot`
- User-specific task filtering
- Proper error handling and loading states

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Firebase:
   - Update `src/config/firebaseconfig.tsx` with your Firebase credentials

3. Run the app:
   ```bash
   npm run android  # for Android
   npm run ios      # for iOS
   ```

## Dependencies

- `react-native-swipe-list-view`: For swipe gesture functionality
- `@react-native-firebase/firestore`: For Firebase database operations
- `@react-native-firebase/auth`: For user authentication
- `react-native-vector-icons`: For UI icons

## File Structure

```
src/
├── screens/
│   ├── homepage.tsx          # Main task list with search and swipe
│   └── AddTaskScreen.tsx     # Add/edit task form
├── config/
│   └── firebaseconfig.tsx    # Firebase configuration
└── navigation/
    └── AppNavigator.tsx      # Navigation setup
```

## Usage

1. **Search Tasks**: Use the search bar to filter tasks by title or tags
2. **Edit Task**: Swipe right on any task to edit it
3. **Delete Task**: Swipe left on any task to delete it (with confirmation)
4. **Add Task**: Use the + button in the bottom tab to add new tasks
5. **Complete Task**: Tap on a task to mark it as complete/incomplete

## Features Added

✅ **Search Bar with Filter Icon**: Real-time task filtering
✅ **Firebase Task Fetching**: Real-time data synchronization
✅ **Right Swipe Edit**: Edit tasks with swipe gesture
✅ **Left Swipe Delete**: Delete tasks with confirmation
✅ **User Authentication**: Secure task management per user
✅ **Real-time Updates**: Live task updates across devices
=======
# Task-Manager-App
>>>>>>> 8f448c3bc69602c96c27a0b4ab9265f2aeca9adb
