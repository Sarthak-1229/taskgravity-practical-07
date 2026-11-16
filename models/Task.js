/**
 * Task Mongoose Model for MongoDB NoSQL Database
 */

const { getMongoose } = require('../config/db');
const mongoose = getMongoose();

let TaskModel = null;

if (mongoose) {
  const taskSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'Task title is required.'],
        trim: true,
        minlength: [3, 'Task title must be at least 3 characters.'],
        maxlength: [80, 'Task title cannot exceed 80 characters.']
      },
      category: {
        type: String,
        required: [true, 'Category is required.'],
        enum: {
          values: ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'UI/UX'],
          message: '{VALUE} is not a valid architectural category.'
        }
      },
      priority: {
        type: String,
        required: [true, 'Priority is required.'],
        enum: {
          values: ['Low', 'Medium', 'High', 'Urgent'],
          message: '{VALUE} is not a valid priority level.'
        },
        default: 'Medium'
      },
      dueDate: {
        type: Date,
        required: [true, 'Target deadline date is required.']
      },
      estimatedHours: {
        type: Number,
        required: [true, 'Estimated effort (hours) is required.'],
        min: [0.5, 'Effort must be at least 0.5 hours.'],
        max: [100, 'Effort cannot exceed 100 hours.']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters.'],
        default: ''
      },
      status: {
        type: String,
        enum: {
          values: ['pending', 'in-progress', 'completed'],
          message: '{VALUE} is not a valid status.'
        },
        default: 'pending'
      }
    },
    {
      timestamps: true
    }
  );

  // Composite compound index for fast query filtering
  taskSchema.index({ status: 1, category: 1, priority: 1 });

  // Virtual for formatted ISO date
  taskSchema.virtual('dueDateFormatted').get(function () {
    return this.dueDate ? this.dueDate.toISOString().split('T')[0] : '';
  });

  taskSchema.set('toJSON', { virtuals: true });
  taskSchema.set('toObject', { virtuals: true });

  TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
}

module.exports = TaskModel;
