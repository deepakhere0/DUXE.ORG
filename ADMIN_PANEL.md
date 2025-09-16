# 🛡️ DUXE Admin Panel Documentation

The DUXE Admin Panel provides comprehensive tools for managing the student platform, including user management, content moderation, file handling, and analytics.

## 🚀 Quick Start

### Accessing the Admin Panel

1. **Admin Account Required**: You need an account with `role: "admin"` in Firestore
2. **Login**: Sign in to your admin account
3. **Navigate**: Click "Admin Panel" in the user menu or go to `/admin/dashboard`

### Default Admin Setup

To create your first admin user:

1. Create a regular account through signup
2. Manually update the user's role in Firestore:
   ```javascript
   // In Firestore Console, update the user document:
   {
     "role": "admin",
     // ... other user fields
   }
   ```

## 📊 Dashboard Overview

The admin dashboard provides:
- **Real-time statistics** (users, notes, pending reviews)
- **Recent activity** monitoring
- **Quick action buttons** for common tasks
- **Content status overview** (approved, pending, rejected)

### Key Metrics Tracked:
- Total Users
- Total Notes  
- Pending Reviews (real-time updates)
- Monthly Growth

## 👥 User Management

### Features:
- **View all users** with pagination (10 users per page)
- **Search users** by name, email, or university
- **Filter by role** (student, teacher, admin)
- **Edit user profiles** (name, email, university, skills, bio)
- **Change user roles** (promote/demote users)
- **Delete users** (permanent action with confirmation)

### User Information Displayed:
- Profile picture (initials-based avatar)
- Display name and email
- Role with colored badges
- University affiliation
- Join date and last activity
- Quick actions (edit, role change, delete)

## 📝 Review Queue (Content Moderation)

### Features:
- **View pending uploads** awaiting approval
- **Preview files** before making decisions
- **Approve content** to make it publicly visible
- **Reject content** with optional reason
- **Real-time updates** when new content is submitted
- **Detailed file information** (course, university, author)

### Workflow:
1. User uploads note → Status: `pending`
2. Admin reviews in queue
3. Admin approves → Status: `approved` → Public
4. Admin rejects → Status: `rejected` → Only visible to owner

## 📁 File Management

### Features:
- **View all uploaded files** with metadata
- **File type filtering** (PDF, images, videos, documents)
- **Search files** by name, author, or course code
- **Preview files** (PDF, images) directly in browser
- **Upload files** directly as admin (auto-approved)
- **Delete files** and associated database records
- **File size and type information**

### Supported File Types:
- **PDF documents** (with inline preview)
- **Images** (JPG, PNG, GIF, WebP)
- **Videos** (MP4, WebM)
- **Documents** (DOC, DOCX)

### Admin File Uploads:
- Drag-and-drop interface
- Multiple file selection
- Auto-approval for admin uploads
- Automatic metadata extraction

## 📈 Analytics & Insights

### Overview Analytics:
- **User growth** trends over time
- **Content statistics** with growth percentages
- **Popular content** ranking by downloads
- **Activity charts** (7-day view with users/notes data)

### Detailed Analytics:
- **University distribution** of users
- **Department breakdown** with visual progress bars
- **Download tracking** and AI tool usage
- **Time-based filtering** (7d, 30d, 90d)

### Metrics Tracked:
- Total downloads
- AI tool usage (summaries, MCQs, flashcards)
- User registration trends
- Content upload patterns

## 🎨 User Interface Features

### Design Elements:
- **Sidebar navigation** with active state indicators
- **Consistent color coding** (roles, status, file types)
- **Responsive design** for mobile and desktop
- **Real-time updates** with loading states
- **Toast notifications** for user feedback
- **Modal dialogs** for detailed actions

### Color Coding System:
- **Admin Role**: Red badges and accents
- **Teacher Role**: Blue badges
- **Student Role**: Green badges
- **Approved Content**: Green indicators
- **Pending Content**: Yellow indicators
- **Rejected Content**: Red indicators

## 🔧 Technical Implementation

### Architecture:
- **React components** with hooks for state management
- **Firestore integration** for real-time data
- **Firebase Storage** for file management
- **Protected routes** requiring admin authentication
- **Context-based auth** with role checking

### Key Components:
```
src/
├── pages/admin/
│   ├── AdminDashboard.jsx     # Main dashboard
│   ├── UserManagement.jsx     # User CRUD operations
│   ├── ReviewQueue.jsx        # Content moderation
│   ├── FileManagement.jsx     # File handling
│   └── Analytics.jsx          # Statistics & insights
├── components/admin/
│   ├── AdminLayout.jsx        # Layout wrapper
│   └── AdminSidebar.jsx       # Navigation sidebar
```

### Database Collections Used:
- `users` - User management and role assignments
- `notes` - Content moderation and file tracking
- `analytics` - Usage statistics and tracking
- `universities` - Institution data for filtering
- `departments` - Department information

## 🔐 Security & Permissions

### Role-Based Access:
- **Admin required** for all admin panel access
- **Protected routes** with automatic redirection
- **Firebase security rules** enforcing permissions
- **Client-side role checking** with server-side validation

### Security Rules:
```javascript
// Firestore Security Rules Example
match /notes/{noteId} {
  allow read: if resource.data.status == 'approved' || 
              isAdmin() || 
              isOwner(resource.data.createdBy);
  allow update: if isAdmin() || isOwner(resource.data.createdBy);
}
```

## 📱 Mobile Responsiveness

### Features:
- **Responsive design** adapts to all screen sizes
- **Touch-friendly** buttons and interactions
- **Mobile navigation** with collapsible sidebar
- **Optimized tables** with horizontal scrolling
- **Touch gestures** for modal interactions

## 🚀 Getting Started for Developers

### Setup:
1. Ensure Firebase is configured
2. Admin components are auto-imported in `App.jsx`
3. Admin routes are protected by `ProtectedRoute`
4. Admin layout provides consistent navigation

### Development:
```bash
# Start development server
npm run dev

# Access admin panel at:
# http://localhost:3000/admin/dashboard
```

### Adding New Admin Features:
1. Create component in `src/pages/admin/`
2. Add route to `App.jsx` admin routes
3. Add navigation item to `AdminSidebar.jsx`
4. Implement proper permission checks

## 🔍 Troubleshooting

### Common Issues:

**Admin Access Denied:**
- Verify user has `role: "admin"` in Firestore
- Check Firebase Auth is working
- Ensure user is logged in

**File Upload Issues:**
- Check Firebase Storage is configured
- Verify file size limits
- Ensure proper file types are allowed

**Data Not Loading:**
- Verify Firestore collections exist
- Check Firebase security rules
- Ensure proper indexes are created

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Classes](https://tailwindcss.com/docs)

---

## 🎯 Admin Panel Features Summary

| Feature | Description | Status |
|---------|-------------|--------|
| Dashboard | Overview stats and quick actions | ✅ Complete |
| User Management | CRUD operations for users | ✅ Complete |
| Review Queue | Content moderation workflow | ✅ Complete |
| File Management | File upload, preview, delete | ✅ Complete |
| Analytics | Platform insights and metrics | ✅ Complete |
| Mobile Support | Responsive design | ✅ Complete |
| Real-time Updates | Live data synchronization | ✅ Complete |
| Role-based Access | Security and permissions | ✅ Complete |

The DUXE Admin Panel provides a complete solution for managing your student platform with intuitive interfaces, real-time data, and comprehensive functionality. 🎉
