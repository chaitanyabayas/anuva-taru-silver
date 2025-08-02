# Quick Start Guide

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Node.js

- **Windows**: Download from https://nodejs.org/en/download/
- **macOS**: Download from https://nodejs.org/en/download/ or use `brew install node`
- **Linux**: Use your package manager:

  ```bash
  # Ubuntu/Debian
  sudo apt update && sudo apt install nodejs npm

  # CentOS/RHEL
  sudo yum install nodejs npm

  # Arch Linux
  sudo pacman -S nodejs npm
  ```

### 2. Install Dependencies

```bash
# Navigate to the project directory
cd AnuvaTaruSilver/App

# Install dependencies
npm install

# Setup directories (optional - they're created automatically)
npm run setup
```

### 3. Start the Application

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 4. Access the Application

- **User Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 5. Default Admin Credentials

- **Email**: admin@anuvataru.com
- **Password**: admin123

## Important Notes

### Security

- Change the default admin password immediately in production
- Update the JWT_SECRET in the .env file for production
- The application includes built-in security features

### Images

- Add jewelry images to `public/images/` directory
- See `public/images/README.md` for required image specifications
- The application works without images but looks better with them

### Database

- SQLite database is created automatically on first run
- Database file is stored in the `database/` directory
- Easy to migrate to PostgreSQL or Oracle later

## Troubleshooting

### Common Issues

1. **"Command 'node' not found"**

   - Install Node.js from the official website
   - Make sure Node.js is in your system PATH

2. **"npm install" fails**

   - Check your internet connection
   - Try clearing npm cache: `npm cache clean --force`
   - Delete `node_modules` and try again

3. **Permission errors on Linux/macOS**

   - Use `sudo` for installation commands if needed
   - Or set up npm without sudo: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

4. **Port 3000 already in use**
   - Change the PORT in the .env file
   - Or stop the application using port 3000

### Getting Help

- Check the console output for error messages
- Review the main README.md for detailed documentation
- Ensure all file permissions are correct

## Next Steps

1. Add your jewelry images
2. Customize the content and styling
3. Add your products through the admin panel
4. Update contact information
5. Configure for production deployment
