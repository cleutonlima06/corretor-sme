# **App Name**: Corretor SME Pro

## Core Features:

- Official Answer Key Definition: Define and update the correct answer key for a specified number of questions using an interactive UI.
- Student Performance Input: Intuitive user interface for entering student names and their corresponding answers question by question.
- Automatic Grading and Scoring: Automatically calculate individual student scores and performance percentages by comparing against the official answer key.
- Student Data Persistence: Securely save all student names, answers, and scores to the Firebase Firestore cloud database.
- Overall Class Performance Dashboard: Visualize aggregated student performance metrics (critical, intermediate, adequate) through dynamic charts.
- Individual Student Record Management: View a list of recorded students with their scores and performance status, including an option to remove individual records from the cloud.
- AI-powered Difficulty Analysis tool: A tool that analyzes aggregated student responses to identify common errors and suggests potential problematic questions or learning topics for educators.

## Style Guidelines:

- Primary color: Standard green (#4CAF50). Chosen for its association with growth, learning, and calmness, perfect for an educational tool. This color will be used for main interactive elements and branding.
- Background color: A very light, desaturated green (#E8F5E9). Provides a clean, modern, and unobtrusive canvas for content.
- Accent color: A vibrant light green/teal (#81C784). This analogous hue provides a fresh contrast, highlighting important actions and feedback elements.
- Headline and body font: 'Poppins', a sans-serif typeface, used uniformly throughout the application for a contemporary, clean, and highly readable aesthetic.
- Utilize a set of crisp, consistent line-art icons for actions like printing and data deletion. Status indicators (e.g., performance categories) should use color-coded dots as visually established in the current design.
- Implement a mobile-first design strategy, featuring clearly delineated sections for different functionalities. Employ flexible grid layouts for answer input, ensuring adaptability across various screen sizes, complemented by robust print-specific styling.
- Incorporate subtle visual feedback through animations, such as gentle scaling on interactive elements like answer boxes and buttons, alongside a smooth fading transition for toast notifications to enhance user experience.