<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Anuva Taru Silver - Jewelry Showcase Website

This is a handcrafted silver jewelry showcase website with both user frontend and admin panel.

## Project Context

### Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (designed for easy migration to PostgreSQL/Oracle)
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Authentication**: JWT-based admin authentication
- **File Upload**: Multer for image handling
- **Security**: Helmet.js, CORS, rate limiting, input validation

### Architecture

- **Lightweight**: Minimal dependencies, efficient performance
- **Secure**: Input validation, rate limiting, secure authentication
- **Scalable**: Easy database migration path, modular code structure
- **Responsive**: Mobile-first design approach

### Database Schema

- **Products**: jewelry items with images, categories, pricing
- **Users**: admin authentication
- **Contact Submissions**: customer inquiries

### Key Features

- User frontend with Home, Catalog, Gallery, Contact pages
- Admin panel for product management (CRUD operations)
- Contact form handling
- Image upload and management
- Product visibility controls
- Featured product system

### Code Patterns

- RESTful API design
- Express middleware for authentication and validation
- Modular JavaScript for frontend functionality
- CSS Grid and Flexbox for responsive layouts
- Error handling and user feedback
- Client-side and server-side validation

### File Structure

- `server.js` - Main server file with all routes and database logic
- `public/` - Static frontend files
- `public/css/` - Stylesheets for user and admin interfaces
- `public/js/` - JavaScript modules for different pages
- Database auto-created in `database/` directory
- Uploads stored in `uploads/` directory

### Development Guidelines

- Maintain security best practices
- Keep code modular and maintainable
- Follow RESTful API conventions
- Ensure responsive design
- Validate input on both client and server
- Provide meaningful error messages
- Use semantic HTML and accessible design
