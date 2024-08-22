import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton, FAB, Button, Dialog, Portal, RadioButton, Provider, Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      category,
      priority,
      dueDate: dueDate.toDateString(),
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setTaskText('');
    setShowDialog(false);
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
  };

  const handleToggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const handleEditTask = () => {
    const updatedTasks = tasks.map((task) =>
      task.id === selectedTask.id ? { ...selectedTask, text: taskText, category, priority, dueDate: dueDate.toDateString() } : task
    );
    saveTasks(updatedTasks);
    setTaskText('');
    setSelectedTask(null);
    setShowDialog(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const openDialogForEdit = (task) => {
    setSelectedTask(task);
    setTaskText(task.text);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(new Date(task.dueDate));
    setShowDialog(true);
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <View>
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => handleToggleTaskCompletion(item.id)}
        />
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.text} - {item.category} - {item.priority}
        </Text>
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
      </View>
      <View style={styles.taskActions}>
        <IconButton icon="pencil" onPress={() => openDialogForEdit(item)} />
        <IconButton icon="delete" onPress={() => handleDeleteTask(item.id)} />
      </View>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            setSelectedTask(null);
            setTaskText('');
            setCategory('Work');
            setPriority('Medium');
            setDueDate(new Date());
            setShowDialog(true);
          }}
        />
        <Portal>
          <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
            <Dialog.Title>{selectedTask ? 'Edit Task' : 'Add Task'}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Task"
                value={taskText}
                onChangeText={setTaskText}
                style={styles.input}
              />
              <RadioButton.Group onValueChange={setCategory} value={category}>
                <RadioButton.Item label="Work" value="Work" />
                <RadioButton.Item label="Personal" value="Personal" />
              </RadioButton.Group>
              <RadioButton.Group onValueChange={setPriority} value={priority}>
                <RadioButton.Item label="High" value="High" />
                <RadioButton.Item label="Medium" value="Medium" />
                <RadioButton.Item label="Low" value="Low" />
              </RadioButton.Group>
              <Button onPress={() => setShowDatePicker(true)}>
                Pick Due Date
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDialog(false)}>Cancel</Button>
              <Button onPress={selectedTask ? handleEditTask : handleAddTask}>
                {selectedTask ? 'Save' : 'Add'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  taskText: {
    fontSize: 18,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  dueDate: {
    fontSize: 14,
    color: 'gray',
  },
  taskActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  input: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default App;
