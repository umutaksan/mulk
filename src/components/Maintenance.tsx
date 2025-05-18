import React, { useState, useEffect } from 'react';
import { PenTool as Tool, Plus, Calendar, Home, Filter, CheckCircle2, Clock, AlertTriangle, Euro, Trash2 } from 'lucide-react';
import { Booking } from '../types/Booking';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface MaintenanceProps {
  bookings: Booking[];
  bookingsByProperty: { [property: string]: Booking[] };
}

interface MaintenanceTask {
  id: string;
  property: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  price: number;
}

const Maintenance: React.FC<MaintenanceProps> = ({
  bookings,
  bookingsByProperty
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    property: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    price: 0
  });

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const properties = ['All', ...Object.keys(bookingsByProperty)];

  // Fetch tasks from Supabase on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          id,
          title,
          description,
          due_date,
          priority,
          status,
          price,
          properties(name)
        `);

      if (error) throw error;

      const formattedTasks = data.map(task => ({
        id: task.id,
        property: task.properties.name,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        price: task.price
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.property || !newTask.title || !newTask.due_date) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get property_id from properties table
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('name', newTask.property)
        .maybeSingle();

      if (propertyError) {
        throw propertyError;
      }

      if (!propertyData) {
        alert('Property not found. Please select a valid property.');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert({
          property_id: propertyData.id,
          title: newTask.title,
          description: newTask.description || '',
          due_date: newTask.due_date,
          priority: newTask.priority as 'low' | 'medium' | 'high',
          status: 'pending',
          price: newTask.price || 0
        })
        .select(`
          id,
          title,
          description,
          due_date,
          priority,
          status,
          price,
          properties(name)
        `)
        .single();

      if (error) throw error;

      // Add the new task to the local state
      setTasks([...tasks, {
        id: data.id,
        property: data.properties.name,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        priority: data.priority,
        status: data.status,
        price: data.price
      }]);

      setNewTask({
        property: '',
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
        price: 0
      });
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const { error } = await supabase
          .from('maintenance_tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;

        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const filteredTasks = selectedProperty === 'All' 
    ? tasks 
    : tasks.filter(task => task.property === selectedProperty);

  const totalMaintenanceExpenses = filteredTasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.price, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tool className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Maintenance</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="border-none bg-transparent focus:ring-0 text-sm"
            >
              {properties.map(property => (
                <option key={property} value={property}>
                  {property}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Total Maintenance Expenses */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <Euro className="h-5 w-5 text-green-600" />
          <h3 className="font-medium text-green-800">Total Maintenance Expenses</h3>
        </div>
        <p className="text-2xl font-bold text-green-700">
          €{totalMaintenanceExpenses.toLocaleString()}
        </p>
        <p className="text-sm text-green-600 mt-1">
          Total for completed maintenance tasks
        </p>
      </div>

      {showNewTaskForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">New Maintenance Task</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property
              </label>
              <select
                value={newTask.property}
                onChange={(e) => setNewTask({ ...newTask, property: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Property</option>
                {properties.filter(p => p !== 'All').map(property => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (€)
                </label>
                <input
                  type="number"
                  value={newTask.price}
                  onChange={(e) => setNewTask({ ...newTask, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">{task.property}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                  className={`rounded-full text-sm border-none ${getStatusColor(task.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-medium mb-2">{task.title}</h4>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span>Price: €{task.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maintenance;