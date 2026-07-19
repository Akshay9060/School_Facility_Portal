/* ============================================================
   School Facility Condition Reporting & Repair Tracking Portal
   Complete Application Logic
   ============================================================ */

// ============================================================
// Data Layer
// ============================================================

const STORAGE_KEY = 'school_facility_portal';
let currentUser = null;
let issues = [];
let users = [];
let notifications = [];

// Initialize data
function initData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const data = JSON.parse(stored);
            users = data.users || [];
            issues = data.issues || [];
            notifications = data.notifications || [];
            return;
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
    
    // Seed data
    users = [
        {
            id: '1',
            name: 'Admin User',
            email: 'admin@school.edu',
            password: 'admin123',
            role: 'admin',
            school: 'Central High School',
            phone: '555-0100',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Teacher John',
            email: 'teacher@school.edu',
            password: 'teacher123',
            role: 'teacher',
            school: 'Central High School',
            phone: '555-0101',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Parent Smith',
            email: 'parent@school.edu',
            password: 'parent123',
            role: 'parent',
            school: 'Central High School',
            phone: '555-0102',
            createdAt: new Date().toISOString()
        }
    ];
    
    issues = [
        {
            id: '1',
            title: 'Broken chairs in Classroom 301',
            category: 'furniture',
            priority: 'high',
            location: 'Building A, 3rd Floor, Room 301',
            description: '5 chairs are broken and unstable, posing safety risk to students.',
            status: 'in-progress',
            reportedBy: '2',
            reportedByName: 'Teacher John',
            school: 'Central High School',
            images: [],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            assignedTo: 'Maintenance Team',
            timeline: [
                { status: 'pending', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
                { status: 'in-progress', note: 'Maintenance team assigned', timestamp: new Date(Date.now() - 86400000).toISOString() }
            ]
        },
        {
            id: '2',
            title: 'Damaged toilet in Boys Washroom',
            category: 'toilet',
            priority: 'urgent',
            location: 'Building B, Ground Floor, Boys Washroom',
            description: 'Two toilet stalls are not flushing properly and one is completely broken.',
            status: 'pending',
            reportedBy: '3',
            reportedByName: 'Parent Smith',
            school: 'Central High School',
            images: [],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            assignedTo: null,
            timeline: [
                { status: 'pending', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000).toISOString() }
            ]
        },
        {
            id: '3',
            title: 'Flickering lights in Hallway',
            category: 'electrical',
            priority: 'medium',
            location: 'Building A, 2nd Floor, Main Hallway',
            description: 'Multiple lights are flickering and one has completely stopped working.',
            status: 'resolved',
            reportedBy: '2',
            reportedByName: 'Teacher John',
            school: 'Central High School',
            images: [],
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            assignedTo: 'Electrician Team',
            timeline: [
                { status: 'pending', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
                { status: 'in-progress', note: 'Electrician assigned', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
                { status: 'resolved', note: 'Lights replaced and fixed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }
            ]
        }
    ];
    
    notifications = [
        {
            id: '1',
            userId: '2',
            issueId: '3',
            title: 'Issue Resolved: Flickering lights',
            message: 'The issue "Flickering lights in Hallway" has been resolved.',
            type: 'resolved',
            read: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: '2',
            userId: '2',
            issueId: '1',
            title: 'Status Update: Broken chairs',
            message: 'Maintenance team has been assigned to address the broken chairs.',
            type: 'update',
            read: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    saveData();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        users,
        issues,
        notifications
    }));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 86400000 * 7) return Math.floor(diff / 86400000) + 'd ago';
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================================
// Toast Notification System
// ============================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ============================================================
// Page Navigation
// ============================================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// ============================================================
// Authentication
// ============================================================

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        errorDiv.textContent = 'Invalid email or password. Please try again.';
        return;
    }
    
    currentUser = user;
    document.getElementById('loginForm').reset();
    errorDiv.textContent = '';
    
    showToast(`Welcome back, ${user.name}!`, 'success');
    enterDashboard();
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;
    const school = document.getElementById('regSchool').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
    }
    
    if (users.some(u => u.email === email)) {
        errorDiv.textContent = 'An account with this email already exists.';
        return;
    }
    
    const newUser = {
        id: generateId(),
        name,
        email,
        password,
        role,
        school,
        phone,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData();
    currentUser = newUser;
    
    document.getElementById('registerForm').reset();
    errorDiv.textContent = '';
    
    showToast(`Account created successfully! Welcome ${name}`, 'success');
    enterDashboard();
}

function handleLogout() {
    currentUser = null;
    showPage('landingPage');
    showToast('Logged out successfully.', 'info');
    updateLandingStats();
}

function enterDashboard() {
    showPage('dashboardPage');
    updateDashboard();
}

// ============================================================
// Dashboard Functions
// ============================================================

function updateDashboard() {
    // Update greeting
    document.getElementById('userGreeting').textContent = `Welcome, ${currentUser.name}`;
    
    // Show/hide admin panel link
    const adminLink = document.getElementById('adminPanelLink');
    if (currentUser.role === 'admin') {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
    
    // Update all dashboard sections
    updateOverview();
    updateMyIssues();
    updateTracking();
    updateNotifications();
    updateAdminPanel();
    updateCategoryChart();
    updateRecentIssues();
}

function updateOverview() {
    const userIssues = issues.filter(i => i.reportedBy === currentUser.id);
    const total = userIssues.length;
    const pending = userIssues.filter(i => i.status === 'pending').length;
    const inProgress = userIssues.filter(i => i.status === 'in-progress').length;
    const resolved = userIssues.filter(i => i.status === 'resolved').length;
    
    document.getElementById('totalIssues').textContent = total;
    document.getElementById('pendingIssues').textContent = pending;
    document.getElementById('inProgressIssues').textContent = inProgress;
    document.getElementById('resolvedIssues').textContent = resolved;
}

function updateMyIssues() {
    const container = document.getElementById('myIssuesList');
    const statusFilter = document.getElementById('filterStatus').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    
    let filtered = issues.filter(i => i.reportedBy === currentUser.id);
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(i => i.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(i => i.category === categoryFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-light);">
                <i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:12px;"></i>
                <p>No issues found. Start by reporting an issue!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(issue => createIssueCard(issue)).join('');
}

function updateTracking() {
    const container = document.getElementById('trackingList');
    const userIssues = issues.filter(i => i.reportedBy === currentUser.id);
    
    if (userIssues.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-light);">
                <i class="fas fa-chart-line" style="font-size:3rem;display:block;margin-bottom:12px;"></i>
                <p>No issues to track yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userIssues.map(issue => `
        <div class="issue-card priority-${issue.priority}">
            <div class="issue-header">
                <div>
                    <div class="issue-title">${escapeHtml(issue.title)}</div>
                    <div class="issue-meta">
                        <span><i class="fas fa-tag"></i> ${capitalize(issue.category)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(issue.location)}</span>
                        <span><i class="fas fa-clock"></i> Reported ${formatDate(issue.createdAt)}</span>
                    </div>
                </div>
                <span class="issue-status status-${issue.status}">${capitalize(issue.status)}</span>
            </div>
            <div style="margin-top:12px;">
                <strong>Progress Timeline:</strong>
                <div style="margin-top:8px;padding-left:8px;border-left:3px solid var(--primary);">
                    ${issue.timeline.map(t => `
                        <div style="margin-bottom:6px;font-size:0.9rem;">
                            <span style="font-weight:600;">${capitalize(t.status)}:</span>
                            ${escapeHtml(t.note)}
                            <span style="color:var(--text-light);font-size:0.8rem;margin-left:8px;">
                                ${formatDateTime(t.timestamp)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function updateNotifications() {
    const container = document.getElementById('notificationsList');
    const userNotifications = notifications.filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update badge
    const unreadCount = userNotifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline' : 'none';
    
    if (userNotifications.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-light);">
                <i class="fas fa-bell" style="font-size:3rem;display:block;margin-bottom:12px;"></i>
                <p>No notifications yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userNotifications.map(n => `
        <div class="notification-item ${!n.read ? 'unread' : ''}">
            <div class="icon ${n.type === 'resolved' ? 'success' : n.type === 'warning' ? 'warning' : 'info'}">
                <i class="fas ${n.type === 'resolved' ? 'fa-check-circle' : n.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            </div>
            <div class="content">
                <div class="title">${escapeHtml(n.title)}</div>
                <div>${escapeHtml(n.message)}</div>
                <div class="time">${formatDate(n.createdAt)}</div>
            </div>
            ${!n.read ? `<button onclick="markNotificationRead('${n.id}')" class="btn btn-small btn-primary">Mark Read</button>` : ''}
        </div>
    `).join('');
}

function markNotificationRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveData();
        updateNotifications();
    }
}

function updateAdminPanel() {
    if (currentUser.role !== 'admin') return;
    
    const allIssues = issues;
    const total = allIssues.length;
    const pending = allIssues.filter(i => i.status === 'pending').length;
    const inProgress = allIssues.filter(i => i.status === 'in-progress').length;
    const resolved = allIssues.filter(i => i.status === 'resolved').length;
    
    document.getElementById('adminTotalIssues').textContent = total;
    document.getElementById('adminPendingIssues').textContent = pending;
    
    // Calculate average resolution time
    const resolvedIssues = allIssues.filter(i => i.status === 'resolved' && i.timeline.length > 0);
    let avgTime = 0;
    if (resolvedIssues.length > 0) {
        const totalTime = resolvedIssues.reduce((sum, issue) => {
            const created = new Date(issue.createdAt);
            const resolved = new Date(issue.timeline[issue.timeline.length - 1].timestamp);
            return sum + (resolved - created);
        }, 0);
        avgTime = totalTime / resolvedIssues.length;
        avgTime = Math.round(avgTime / (1000 * 60 * 60)); // Hours
    }
    document.getElementById('adminAvgResolutionTime').textContent = avgTime > 0 ? `${avgTime}h` : '—';
    
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    document.getElementById('adminResolutionRate').textContent = `${resolutionRate}%`;
    
    // Admin issues list
    const container = document.getElementById('adminIssuesList');
    if (allIssues.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-light);">
                <i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:12px;"></i>
                <p>No issues reported yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allIssues.map(issue => `
        <div class="issue-card priority-${issue.priority}">
            <div class="issue-header">
                <div>
                    <div class="issue-title">${escapeHtml(issue.title)}</div>
                    <div class="issue-meta">
                        <span><i class="fas fa-user"></i> ${escapeHtml(issue.reportedByName)}</span>
                        <span><i class="fas fa-tag"></i> ${capitalize(issue.category)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(issue.location)}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(issue.createdAt)}</span>
                    </div>
                </div>
                <span class="issue-status status-${issue.status}">${capitalize(issue.status)}</span>
            </div>
            <div class="issue-actions">
                ${issue.status === 'pending' ? `
                    <button onclick="adminUpdateStatus('${issue.id}', 'in-progress')" class="btn btn-primary btn-small">
                        <i class="fas fa-play"></i> Start Progress
                    </button>
                ` : ''}
                ${issue.status === 'in-progress' ? `
                    <button onclick="adminUpdateStatus('${issue.id}', 'resolved')" class="btn btn-success btn-small">
                        <i class="fas fa-check"></i> Mark Resolved
                    </button>
                ` : ''}
                ${issue.status === 'pending' ? `
                    <button onclick="adminAssignStaff('${issue.id}')" class="btn btn-ghost btn-small">
                        <i class="fas fa-user-plus"></i> Assign Staff
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function adminUpdateStatus(issueId, newStatus) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    issue.status = newStatus;
    issue.updatedAt = new Date().toISOString();
    issue.timeline.push({
        status: newStatus,
        note: `Status updated to ${newStatus} by admin`,
        timestamp: new Date().toISOString()
    });
    
    // Add notification for reporter
    const statusMessages = {
        'in-progress': 'Your reported issue is now in progress.',
        'resolved': 'Your reported issue has been resolved!'
    };
    
    notifications.push({
        id: generateId(),
        userId: issue.reportedBy,
        issueId: issue.id,
        title: `Status Update: ${issue.title}`,
        message: statusMessages[newStatus] || `Issue status updated to ${newStatus}`,
        type: newStatus === 'resolved' ? 'resolved' : 'update',
        read: false,
        createdAt: new Date().toISOString()
    });
    
    saveData();
    showToast(`Issue status updated to ${newStatus}`, 'success');
    updateDashboard();
    updateLandingStats();
}

function adminAssignStaff(issueId) {
    const staffName = prompt('Enter the name of the staff member to assign:');
    if (!staffName) return;
    
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    issue.assignedTo = staffName;
    issue.timeline.push({
        status: 'assigned',
        note: `Assigned to ${staffName}`,
        timestamp: new Date().toISOString()
    });
    
    saveData();
    showToast(`Issue assigned to ${staffName}`, 'success');
    updateDashboard();
}

function updateCategoryChart() {
    const container = document.getElementById('categoryChart');
    const userIssues = issues.filter(i => i.reportedBy === currentUser.id);
    const categories = {};
    
    userIssues.forEach(issue => {
        categories[issue.category] = (categories[issue.category] || 0) + 1;
    });
    
    if (Object.keys(categories).length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-light);">
                <p>No data to display.</p>
            </div>
        `;
        return;
    }
    
    const maxCount = Math.max(...Object.values(categories));
    const colors = ['#2C5F2D', '#4A7C4B', '#F5A623', '#2196F3', '#F44336', '#9C27B0'];
    
    container.innerHTML = Object.entries(categories).map(([category, count], index) => `
        <div class="category-bar">
            <span class="label">${capitalize(category)}</span>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${(count / maxCount) * 100}%; background: ${colors[index % colors.length]};">
                </div>
            </div>
            <span class="count">${count}</span>
        </div>
    `).join('');
}

function updateRecentIssues() {
    const container = document.getElementById('recentIssuesList');
    const userIssues = issues.filter(i => i.reportedBy === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (userIssues.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;color:var(--text-light);">
                <p>No recent issues. Start reporting!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userIssues.map(issue => createIssueCard(issue)).join('');
}

function createIssueCard(issue) {
    return `
        <div class="issue-card priority-${issue.priority}">
            <div class="issue-header">
                <div>
                    <div class="issue-title">${escapeHtml(issue.title)}</div>
                    <div class="issue-meta">
                        <span><i class="fas fa-tag"></i> ${capitalize(issue.category)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(issue.location)}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(issue.createdAt)}</span>
                        ${issue.assignedTo ? `<span><i class="fas fa-user-cog"></i> ${escapeHtml(issue.assignedTo)}</span>` : ''}
                    </div>
                </div>
                <span class="issue-status status-${issue.status}">${capitalize(issue.status)}</span>
            </div>
            <div style="margin-top:8px;font-size:0.9rem;color:var(--text-light);">
                ${escapeHtml(issue.description)}
            </div>
            ${issue.status !== 'resolved' ? `
                <div class="issue-actions">
                    <button onclick="showIssueDetails('${issue.id}')" class="btn btn-ghost btn-small">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function showIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const timeline = issue.timeline.map(t => 
        `• ${capitalize(t.status)}: ${escapeHtml(t.note)} (${formatDateTime(t.timestamp)})`
    ).join('\n');
    
    alert(
        `Title: ${issue.title}\n` +
        `Category: ${capitalize(issue.category)}\n` +
        `Priority: ${capitalize(issue.priority)}\n` +
        `Location: ${issue.location}\n` +
        `Status: ${capitalize(issue.status)}\n` +
        `Reported By: ${issue.reportedByName}\n` +
        `Assigned To: ${issue.assignedTo || 'Not assigned yet'}\n\n` +
        `Description:\n${issue.description}\n\n` +
        `Timeline:\n${timeline}`
    );
}

function filterMyIssues() {
    updateMyIssues();
}

// ============================================================
// Report Issue
// ============================================================

function handleReportIssue(e) {
    e.preventDefault();
    
    const category = document.getElementById('issueCategory').value;
    const priority = document.getElementById('issuePriority').value;
    const location = document.getElementById('issueLocation').value.trim();
    const title = document.getElementById('issueTitle').value.trim();
    const description = document.getElementById('issueDescription').value.trim();
    const images = document.getElementById('issueImages').files;
    
    if (!category || !priority || !location || !title || !description) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    const newIssue = {
        id: generateId(),
        title,
        category,
        priority,
        location,
        description,
        status: 'pending',
        reportedBy: currentUser.id,
        reportedByName: currentUser.name,
        school: currentUser.school,
        images: Array.from(images).map(f => f.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: null,
        timeline: [
            { status: 'pending', note: 'Issue reported', timestamp: new Date().toISOString() }
        ]
    };
    
    issues.push(newIssue);
    
    // Add notification for admin
    const adminUsers = users.filter(u => u.role === 'admin');
    adminUsers.forEach(admin => {
        notifications.push({
            id: generateId(),
            userId: admin.id,
            issueId: newIssue.id,
            title: 'New Issue Reported',
            message: `${currentUser.name} reported: ${title}`,
            type: 'info',
            read: false,
            createdAt: new Date().toISOString()
        });
    });
    
    saveData();
    document.getElementById('reportForm').reset();
    showToast('Issue reported successfully!', 'success');
    updateDashboard();
    updateLandingStats();
    
    // Switch to My Issues tab
    switchDashboardTab('myIssues');
}

// ============================================================
// Dashboard Tab Switching
// ============================================================

function switchDashboardTab(tabId) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === tabId) {
            link.classList.add('active');
        }
    });
    
    // Update content tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    // Refresh data for specific tabs
    if (tabId === 'myIssues') updateMyIssues();
    if (tabId === 'tracking') updateTracking();
    if (tabId === 'notifications') updateNotifications();
    if (tabId === 'adminPanel') updateAdminPanel();
}

// ============================================================
// Landing Page Stats
// ============================================================

function updateLandingStats() {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const uniqueUsers = new Set(issues.map(i => i.reportedBy)).size;
    
    document.getElementById('totalIssuesStat').textContent = total;
    document.getElementById('resolvedIssuesStat').textContent = resolved;
    document.getElementById('activeUsersStat').textContent = uniqueUsers;
}

// ============================================================
// Utility Functions
// ============================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// Initialize Application
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initData();
    updateLandingStats();
    
    // If user was logged in (session), restore
    const storedUser = sessionStorage.getItem('school_facility_user');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            const user = users.find(u => u.id === userData.id);
            if (user) {
                currentUser = user;
                enterDashboard();
                return;
            }
        } catch (e) {
            console.error('Error restoring session:', e);
        }
    }
    
    showPage('landingPage');
});

// Store user session on login
const originalEnterDashboard = enterDashboard;
enterDashboard = function() {
    sessionStorage.setItem('school_facility_user', JSON.stringify({ id: currentUser.id }));
    originalEnterDashboard.call(this);
};

// Clear session on logout
const originalHandleLogout = handleLogout;
handleLogout = function() {
    sessionStorage.removeItem('school_facility_user');
    originalHandleLogout.call(this);
};

// ============================================================
// Keyboard shortcuts
// ============================================================

document.addEventListener('keydown', function(e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        document.querySelector('.nav-links')?.classList.remove('open');
    }
});