/**
 * Practical 07: Frontend Client for Full-Stack MongoDB Task Application
 */

const form = document.getElementById('mongoTaskForm');
const taskListContainer = document.getElementById('taskList');

const statTotal = document.getElementById('statTotal');
const statInProgress = document.getElementById('statInProgress');
const statPending = document.getElementById('statPending');
const statVelocity = document.getElementById('statVelocity');

const dbDot = document.getElementById('dbDot');
const dbStatusText = document.getElementById('dbStatusText');
const dbUriText = document.getElementById('dbUriText');

document.addEventListener('DOMContentLoaded', () => {
  checkDbStatus();
  fetchTasks();
  fetchStats();
});

async function checkDbStatus() {
  try {
    const res = await fetch('/api/db-status');
    const json = await res.json();
    if (json.success && json.status) {
      if (json.status.connected) {
        dbDot.className = 'db-indicator db-connected';
        dbStatusText.textContent = 'MongoDB Atlas / Compass: Connected & Synchronized';
      } else {
        dbDot.className = 'db-indicator db-disconnected';
        dbStatusText.textContent = 'MongoDB Disconnected (Operating via resilient memory cache)';
      }
      dbUriText.textContent = `URI: ${json.status.uri}`;
    }
  } catch (err) {
    dbDot.className = 'db-indicator db-disconnected';
    dbStatusText.textContent = 'Backend offline or unreachable';
  }
}

async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    const json = await res.json();
    if (json.success) renderTasks(json.data);
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/tasks/stats');
    const json = await res.json();
    if (json.success && json.stats) {
      statTotal.textContent = json.stats.total;
      statInProgress.textContent = json.stats.inProgress;
      statPending.textContent = json.stats.pending;
      statVelocity.textContent = `${json.stats.velocity}%`;
    }
  } catch (err) {}
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById('taskTitle').value,
    category: document.getElementById('taskCategory').value,
    priority: document.getElementById('taskPriority').value,
    dueDate: document.getElementById('taskDueDate').value,
    estimatedHours: document.getElementById('taskHours').value,
    description: document.getElementById('taskDesc').value
  };

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (res.status === 201) {
      form.reset();
      fetchTasks();
      fetchStats();
      checkDbStatus();
    } else {
      alert(`Validation / Database Error: ${JSON.stringify(result.errors || result.message)}`);
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
});

async function cycleStatus(id) {
  try {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (res.ok) {
      fetchTasks();
      fetchStats();
    }
  } catch (err) {
    console.error('Failed to cycle status:', err);
  }
}

async function deleteTask(id) {
  if (!confirm('Permanently remove this document from MongoDB?')) return;
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTasks();
      fetchStats();
    }
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
}

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    taskListContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: #fff; border: 1px dashed #e2e8f0; border-radius: 6px; color: #64748b;">
        No documents found in TaskGravityDB collection.
      </div>
    `;
    return;
  }

  taskListContainer.innerHTML = tasks.map(t => {
    const priorityClass = `badge-${t.priority.toLowerCase()}`;
    const statusClass = `badge-${t.status}`;
    const dateStr = t.dueDate ? (t.dueDateFormatted || t.dueDate.split('T')[0]) : '-';

    return `
      <article class="task-card">
        <div class="task-header">
          <span class="task-title">${escapeHTML(t.title)}</span>
          <div style="display: flex; gap: 4px;">
            <span class="badge ${priorityClass}">${t.priority}</span>
            <span class="badge ${statusClass}">${t.status}</span>
          </div>
        </div>
        ${t.description ? `<p class="task-desc">${escapeHTML(t.description)}</p>` : ''}
        <div class="task-meta">
          <div>
            <span class="badge badge-category">${t.category}</span>
            <span style="margin-left: 8px;">Due: <strong>${dateStr}</strong></span>
            <span style="margin-left: 8px;">Est: <strong>${t.estimatedHours}h</strong></span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <code style="font-size: 0.65rem; color: #94a3b8;">${t._id}</code>
            <button class="btn btn-secondary btn-sm" onclick="cycleStatus('${t._id}')">Cycle Status</button>
            <button class="btn btn-sm" style="background: transparent; color: #dc2626;" onclick="deleteTask('${t._id}')">Delete</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
