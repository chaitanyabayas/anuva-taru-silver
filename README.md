# Anuva Taru Silver - Jewelry Showcase Website

A comprehensive website for showcasing handcrafted silver jewelry with both user frontend and admin panel for product management.

## Features

### User Frontend

- **Home Page**: Hero section, featured products, about section, and categories
- **Catalog**: Complete product catalog with filtering and sorting
- **Gallery**: Image gallery with category filtering
- **Contact**: Contact form with validation and FAQ section
- **Responsive Design**: Mobile-friendly design across all pages

### Admin Panel

- **Dashboard**: Overview with statistics and recent activity
- **Product Management**: Add, edit, delete, hide/show products
- **Contact Management**: View and manage contact form submissions
- **Image Upload**: Support for product images
- **Secure Authentication**: JWT-based admin authentication

### Technical Features

- **Lightweight Architecture**: Built with Node.js and Express
- **SQLite Database**: In-app database with easy migration path to PostgreSQL/Oracle
- **Security**: Rate limiting, input validation, CORS, Helmet.js
- **File Upload**: Multer for handling image uploads
- **Responsive Design**: Mobile-first approach
- **Real-time Validation**: Client-side form validation

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Configuration**:

   - Copy `.env` file and update values as needed
   - Default admin credentials: admin@anuvataru.com / admin123

3. **Start the server**:

   ```bash
   npm start
   ```

4. **Access the application**:
   - User Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## Project Structure

```
App/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── database/              # SQLite database (auto-created)
├── uploads/               # User uploaded images (auto-created)
├── public/                # Static frontend files
│   ├── index.html         # Home page
│   ├── catalog.html       # Product catalog
│   ├── gallery.html       # Gallery page
│   ├── contact.html       # Contact page
│   ├── css/               # Public stylesheets
│   │   └── style.css      # Main public styles
│   ├── js/                # Public JavaScript files
│   │   ├── main.js        # Common functionality
│   │   ├── catalog.js     # Catalog page logic
│   │   ├── gallery.js     # Gallery page logic
│   │   └── contact.js     # Contact page logic
│   └── images/            # Static images
├── admin/                 # Admin panel directory
│   ├── index.html         # Admin panel interface
│   ├── css/               # Admin stylesheets
│   │   └── admin.css      # Admin panel styles
│   ├── js/                # Admin JavaScript files
│   │   └── admin.js       # Admin panel logic
│   └── images/            # Admin-specific images
└── README.md              # This file
```

## Database Schema

### Products Table

- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `category` - Product category (rings, necklaces, earrings, bracelets, pendants)
- `material` - Material (default: Silver)
- `weight` - Weight in grams
- `dimensions` - Product dimensions
- `image_url` - Main product image
- `gallery_images` - Additional images (JSON array)
- `is_featured` - Featured product flag
- `is_visible` - Visibility flag
- `stock_quantity` - Stock quantity
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Users Table

- `id` - Primary key
- `email` - Admin email
- `password` - Hashed password
- `role` - User role (admin)
- `created_at` - Creation timestamp

### Contact Submissions Table

- `id` - Primary key
- `name` - Contact name
- `email` - Contact email
- `phone` - Contact phone (optional)
- `message` - Contact message
- `is_read` - Read status
- `created_at` - Submission timestamp

## API Endpoints

### Public APIs

- `GET /api/products` - Get all visible products
- `GET /api/products/:id` - Get single product
- `POST /api/contact` - Submit contact form

### Admin APIs (Protected)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/visibility` - Toggle visibility
- `GET /api/admin/contacts` - Get contact submissions
- `PATCH /api/admin/contacts/:id/read` - Mark contact as read

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes for API endpoints
2. **Input Validation**: Server-side validation using express-validator
3. **File Upload Security**: File type and size restrictions
4. **JWT Authentication**: Secure admin authentication
5. **CORS Protection**: Cross-origin request security
6. **Helmet.js**: Security headers
7. **Password Hashing**: bcryptjs for password encryption

## Database Migration

The application uses SQLite for development but is designed for easy migration to PostgreSQL or Oracle:

### For PostgreSQL:

1. Install `pg` package: `npm install pg`
2. Update database connection in `server.js`
3. Adjust SQL syntax if needed (minimal changes required)

### For Oracle:

1. Install `oracledb` package: `npm install oracledb`
2. Update database connection in `server.js`
3. Adjust SQL syntax for Oracle compatibility

## Development

### Adding New Features

1. **Frontend**: Add HTML, CSS, and JavaScript in the `public/` directory
2. **Backend**: Add routes and logic in `server.js`
3. **Database**: Add new tables in the `initializeDatabase()` function

### Customization

- **Styling**: Modify CSS files in `public/css/`
- **Content**: Update HTML files in `public/`
- **Functionality**: Extend JavaScript files in `public/js/`

## Production Deployment

1. **Environment Variables**:

   - Set `NODE_ENV=production`
   - Update `JWT_SECRET` with a secure key
   - Update admin credentials
   - Set appropriate `PORT`

2. **Database**:

   - Migrate to PostgreSQL or Oracle for production
   - Set up proper database backups

3. **Security**:

   - Use HTTPS
   - Set up proper firewall rules
   - Regular security updates

4. **File Storage**:
   - Consider using cloud storage for uploaded images
   - Set up CDN for static assets

## Support

For support and customization:

- Review the code documentation
- Check the console for error messages
- Ensure all dependencies are properly installed
- Verify database permissions and file upload directories

## License

This project is licensed under the MIT License.

---

**Anuva Taru Silver** - Showcasing handcrafted silver jewelry with modern web technology.
