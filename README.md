<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/19026d4b-151e-4fe8-8793-67a088d1ee30

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


Key Features:

Reader Interface:

Hero Section: Highlights the latest featured story with bold editorial typography.

Article Feed: A responsive grid of blog posts with categories, excerpts, and view counts.

Post Detail: Immersive reading experience with support for Markdown content and a real-time discussion section.

Newsletter: Integrated signup form for readers to subscribe to updates.

Authentication System:

Secure login using Google and GitHub social authentication.

Automatic user profile creation in Firestore.

Role-based access control (Admin vs. Reader).

Admin Dashboard:

Overview: Summary statistics for posts, users, and subscribers.

Post Management: Full CRUD (Create, Read, Update, Delete) operations for blog content.

Editor: A powerful Markdown-based editor for crafting new stories.
