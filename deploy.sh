#!/bin/bash

echo "=============================================="
echo "GlassWall Vercel Emergency Deployment Script"
echo "=============================================="
echo "Starting deployment process..."

# Create a package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << EOL
{
  "name": "glasswall",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.5.6",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
EOL
fi

# Create a minimalist vercel.json
echo "Creating vercel.json..."
cat > vercel.json << EOL
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
EOL

# Add a placeholder pages directory if it doesn't exist
if [ ! -d "pages" ]; then
    echo "Creating pages directory and files..."
    mkdir -p pages
    
    # Create an _app.js file
    cat > pages/_app.js << EOL
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
EOL
    
    # Create an index.js file
    cat > pages/index.js << EOL
export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>GlassWall</h1>
      <p>Emergency deployment for maintenance and testing.</p>
      <p>Last updated: {new Date().toLocaleString()}</p>
    </div>
  )
}
EOL
fi

# Commit changes
echo "Committing changes..."
git add .
git commit -m "Emergency deployment configuration"

# Push changes
echo "Pushing to repository..."
git push origin HEAD

echo ""
echo "Deployment preparation complete."
echo "Check Vercel dashboard for deployment status."
echo "=============================================="