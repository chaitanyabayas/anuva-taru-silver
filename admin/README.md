# Admin Directory

This directory contains all admin-related files for the Anuva Taru Silver jewelry website.

## Structure

```
admin/
├── index.html          # Admin panel HTML (main admin interface)
├── css/
│   └── admin.css       # Admin-specific styles
├── js/
│   └── admin.js        # Admin panel JavaScript functionality
└── images/             # Admin-specific images (if needed)
```

## Access

- **Admin Panel URL**: http://localhost:3000/admin
- **Default Credentials**:
  - Email: admin@anuvataru.com
  - Password: admin123

## Features

- **Product Management**: Add, edit, delete, hide/show products
- **Contact Management**: View and manage customer inquiries
- **Dashboard**: Overview with statistics
- **File Upload**: Product image management
- **Authentication**: Secure JWT-based login

## Security

- All admin routes are protected with JWT authentication
- Rate limiting applied to prevent abuse
- Input validation on all forms
- Secure file upload with type restrictions

## Development

When making changes to admin functionality:

1. **HTML**: Update `index.html` for layout changes
2. **Styles**: Modify `css/admin.css` for styling
3. **JavaScript**: Edit `js/admin.js` for functionality
4. **Server**: Update `server.js` for API changes

## Notes

- The admin directory is served statically by Express
- All API calls are made to `/api/admin/*` endpoints
- Images are uploaded to the `/uploads` directory
- Admin sessions are managed with localStorage tokens
