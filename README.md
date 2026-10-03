🔗 Conn
Share one link. Connect everywhere.

Conn is a full-stack SaaS link-in-bio platform — a premium alternative to Linktree built from scratch. It allows creators, developers, professionals, and businesses to create a stunning, customizable profile that brings their links, social profiles, projects, blogs, and resources together in one place.

With Conn, users can create a personalized digital identity, organize their content, showcase projects, track engagement, and customize the look and feel of their profile.

✨ Features
🎨 26+ Premium Themes
Choose from 26+ professionally designed themes, including Midnight, Neon Cyber, Aurora Borealis, Holographic, Cosmic Nebula, and more.

One-click theme switching
Live preview
Multiple visual styles
Responsive layouts
Designed for creators and professionals
🔗 Link Management
Manage all your important links from a centralized admin dashboard.

Add links
Edit links
Delete links
Enable or disable links
Drag-and-drop reordering
Feature important links
Track link clicks
🗂️ Categorized Link Organization
Organize profile content into structured categories to make profiles easier to navigate.

📁 Projects
Showcase personal, academic, open-source, and professional projects.

🌐 Socials
Connect social media and professional platforms from one place.

📝 Blogs
Highlight articles, blogs, publications, and other written content.

📚 Resources
Share useful tools, documents, websites, references, and other resources.

This structured organization allows visitors to quickly find the type of content they are interested in.

🃏 Rich Link Preview Cards
Enhance links with visually rich preview cards containing relevant metadata.

Preview cards can include:

Link titles
Descriptions
Images
Platform information
Project metadata
Content previews
Projects and important content can also be displayed through dedicated showcase sections, giving creators more space to highlight their work.

👩‍💻 Developer-Focused Profiles
Conn provides profile layouts and templates designed with developers in mind.

Developers can showcase:

Projects
GitHub profiles
Technical blogs
Social platforms
Portfolio links
Open-source work
Developer resources
Dedicated project showcase sections help turn a simple link page into a compact developer portfolio.

📊 Enhanced Analytics
Conn provides deeper insights into how visitors interact with a profile.

Analytics include:

Total profile views
Total link clicks
Top-performing links
Recent activity
Click trends over time
Profile engagement statistics
These insights help users understand which links and content receive the most attention.

🔍 Automatic Social Platform Detection
Conn can automatically detect supported social platforms when users add their profile links.

The platform is identified automatically and the appropriate icon is assigned.

This reduces manual configuration and makes profile creation faster and easier.

🎨 Advanced Theme Customization
Customize the appearance of your profile using a flexible theme customization builder.

Users can configure:

Colors — Backgrounds, text, accents, and highlights
Fonts — Typography and font styles
Buttons — Button appearance and styling
Cards — Card layout, borders, radius, and visual treatment
Overall styling — Create a consistent visual identity
This allows every Conn profile to have its own personalized look and branding.

📈 Real-Time Analytics
Track link engagement directly from the dashboard and monitor profile performance.

Users can view important engagement information without relying on external analytics platforms.

💳 Subscription Plans
Conn supports multiple subscription tiers with Razorpay payment integration.

Available plans:

Free
Plus
Professional
Users can upgrade their plan seamlessly as their needs grow.

🔐 Secure Authentication
Conn uses JWT-based authentication with httpOnly cookies.

The authentication system is designed to work effectively with serverless deployments without relying on in-memory sessions.

🔑 Google Authentication
Sign in or create an account using Google.

Conn uses Google Identity Services and google-auth-library for authentication.

Existing users can continue using Google with the same email, while new users can automatically receive an account and profile.

🌐 Public Profile URLs
Every user receives a unique public profile:

/u/username
The public profile can contain:

Profile information
Social links
Categorized links
Projects
Blogs
Resources
Custom themes
Social icons
Users can share this single URL across their social media profiles, resumes, portfolios, and other platforms.

🔍 SEO Optimized
Conn includes built-in SEO functionality to improve profile discoverability.

Features include:

JSON-LD structured data
SoftwareApplication schema
Person schema
Dynamic meta tags
Sitemap
Robots.txt
Open Graph cards
Twitter cards
📱 Mobile-First
Conn is designed to work across different screen sizes.

The interface is responsive across:

📱 Mobile
💻 Desktop
📟 Tablet
Profiles are optimized for the mobile-first nature of social media traffic.

🛠️ Tech Stack
Layer	Technology
Runtime	Node.js
Backend	Express.js
Database	Supabase / PostgreSQL
Authentication	JWT + httpOnly Cookies + Google OAuth
Payments	Razorpay
Frontend	HTML, CSS, JavaScript
Hosting	Vercel
Analytics	Custom Click & Profile Tracking
📁 Project Structure
Conn/
│
├── server.js                  # Express server and API routes
├── db.js                      # Supabase client
├── vercel.json                # Vercel configuration
├── package.json
│
├── public/
│   ├── home.html              # Landing page
│   ├── index.html             # Public profile / link-in-bio page
│   ├── admin.html             # Admin dashboard
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── robots.txt             # SEO crawler configuration
│   ├── sitemap.xml            # Sitemap
│   │
│   ├── features/
│   │   ├── link-in-bio.html
│   │   ├── social-media.html
│   │   ├── grow.html
│   │   ├── monetize.html
│   │   └── analytics.html
│   │
│   ├── css/
│   │   ├── style.css          # Global styles
│   │   ├── home.css           # Landing page styles
│   │   ├── themes.css         # Theme definitions
│   │   ├── features.css       # Feature page styles
│   │   └── auth.css            # Authentication styles
│   │
│   └── js/
│       ├── app.js             # Public profile logic
│       ├── admin.js           # Dashboard logic
│       ├── auth.js            # Authentication logic
│       ├── home.js            # Landing page interactions
│       └── features.js        # Feature page logic
│
├── scripts/
│   ├── setup-db.sql           # Database setup
│   └── seed-db.js             # Data migration / seeding
│
└── data/
    └── subscriptions.json     # Subscription configuration
🚀 Getting Started
Prerequisites
Make sure the following are installed:

Node.js v18+
npm v9+
Git
A Supabase account
Check your installed versions:

node -v
npm -v
git --version
1. Clone the Repository
git clone https://github.com/mayo-byte07/Conn.git
cd Conn
2. Install Dependencies
npm install
For Google authentication:

npm install google-auth-library
3. Configure Supabase
Create a project on Supabase.
Open Dashboard → SQL Editor.
Run:
scripts/setup-db.sql
Open Settings → API.
Copy your project URL and service role key.
4. Configure Environment Variables
Create a .env file in the root directory.

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
Generate a secure JWT secret:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
⚠️ Never commit your .env file or expose your service role key.

5. Google OAuth Setup
To enable Google authentication:

Open Google Cloud Console.
Create an OAuth Client ID.
Select Web Application.
Add your authorized JavaScript origins.
For local development:

http://localhost:3000
For production:

https://conn-delta.vercel.app
Add the generated Client ID to:

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
6. Start the Application
npm start
Then open:

http://localhost:3000
7. Optional: Seed Existing Data
If you have existing local JSON data:

npm run seed
☁️ Deployment
Conn can be deployed using Vercel.

1. Push to GitHub
git add -A
git commit -m "Deploy Conn"
git push origin main
2. Import into Vercel
Import the GitHub repository into Vercel and configure the following environment variables:

Variable	Description
SUPABASE_URL	Supabase project URL
SUPABASE_SERVICE_KEY	Supabase service role key
JWT_SECRET	JWT secret
NODE_ENV	Production environment
RAZORPAY_KEY_ID	Razorpay key
RAZORPAY_KEY_SECRET	Razorpay secret
GOOGLE_CLIENT_ID	Google OAuth Client ID
The included vercel.json configuration handles the Express server routing.

🔌 API Reference
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Create account
POST	/api/auth/login	Sign in
POST	/api/auth/logout	Sign out
GET	/api/auth/check	Check authentication
GET	/api/auth/check-username/:username	Check username availability
POST	/api/auth/google	Authenticate using Google
GET	/api/auth/google-client-id	Get Google Client ID
Profile & Links
Method	Endpoint	Description
GET	/api/profile	Get authenticated profile
PUT	/api/profile	Update profile
GET	/api/links	Get profile links
POST	/api/links	Add a link
PUT	/api/links/:id	Update a link
DELETE	/api/links/:id	Delete a link
PUT	/api/links-reorder	Reorder links
Public Profiles
Method	Endpoint	Description
GET	/api/u/:username/profile	Get public profile
GET	/api/u/:username/links	Get public links
GET	/api/u/:username/settings	Get public settings
POST	/api/u/:username/links/:id/click	Track link click
Settings & Subscriptions
Method	Endpoint	Description
GET/PUT	/api/settings	Get / update settings
GET	/api/subscription	Get current subscription
GET	/api/plan-limits	Get plan limits and usage
POST	/api/payment/create-order	Create Razorpay order
POST	/api/payment/verify	Verify payment
🧑‍💻 The Maker — Conn
Conn was created by Mayo-byte07 as a full-stack SaaS project focused on building a modern, customizable alternative to traditional link-in-bio platforms.

The project brings together profile creation, link management, content organization, analytics, authentication, subscriptions, and personalization into a single platform.

🎯 Vision
The idea behind Conn is simple:

One profile. One link. Everything connected.

Instead of sharing multiple links across different platforms, Conn gives users one customizable destination where visitors can discover their projects, social profiles, blogs, resources, and other important content.

🤝 Contributing
Contributions are welcome!

If you'd like to contribute:

git clone https://github.com/mayo-byte07/Conn.git
cd Conn
npm install
Create a feature branch:

git checkout -b feature/your-feature
Make your changes, test them locally, and submit a pull request.

For detailed contribution guidelines, refer to:

CONTRIBUTING.md
📜 Releases
Version	What's New
v1.2.0	☁️ Supabase cloud DB, JWT authentication, SEO, Vercel support
v1.1.0	👥 Multi-user SaaS, subscriptions, 26+ themes
v1.0.0	🚀 Initial launch
🛠️ Troubleshooting
Port Already in Use
If port 3000 is already occupied, stop the existing process or configure the application to use another port.

Supabase Connection Issues
Verify:

SUPABASE_URL is correct
SUPABASE_SERVICE_KEY is valid
Database tables have been created
Environment variables are loaded correctly
JWT Errors
Verify that JWT_SECRET exists in your .env file and contains a sufficiently long random value.

Google Authentication Issues
Verify:

GOOGLE_CLIENT_ID is correct
The current domain is added to Google OAuth authorized origins
Google authentication is enabled in your Google Cloud project
📄 License
This project is maintained as the Conn SaaS link-in-bio platform.

 Conn
Share one link. Connect everywhere.

Built to help creators, developers, professionals, and businesses build a personalized digital presence from a single link.##  Attribution & Credits

### Original Project

This project is based on and extends **Conn**, originally created by **Piyush Singh (mayo-byte07)** and developed under **AetherCode Society**.

Original repository:
https://github.com/mayo-byte07/Conn

The original Conn project is licensed under the **MIT License**. The original copyright and license notice have been retained in accordance with the license terms.

### Our Contribution

Our team has extended and modified the project with additional functionality, UI/UX improvements, and feature enhancements, including:

- Enhanced personal identity and profile customization
- User-uploaded profile photos
- Expanded profile and portfolio presentation
- Work and milestones timeline functionality
- Featured project and link management
- Living identity and integrations hub
- Visual profile layout customization
- Sticky and interactive mobile profile preview
- Additional dashboard and profile-editor improvements
- Analytics and identity-management enhancements

These additions and modifications represent our team's development work on top of the original Conn project.

### Contributors

Our team members who contributed to this version are listed in [`CONTRIBUTORS.md`](./CONTRIBUTORS.md).

We are grateful to the original creator and contributors of Conn for the foundation on which this project builds.
