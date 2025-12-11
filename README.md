# ESN Porto Scholarship Manager


This web application allows volunteers to manage and review scholarship applications for the ESN Porto Scholarship. 

* **Dashboard**
  Displays statistics such as application distribution and application status.

## Screenshots

|                  Dashboard                  |
| :------------------------------------------------: |
| <img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/2fa43ddc-046f-4b1a-9e1b-9bbb80febfbc" />
|              Statistics Overview              |

|                    Import View                     |
| :------------------------------------------------: |
| <img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/fcd78d6d-a3d3-4d69-bcd8-3cd6abbbdfb1" />
|              Edition & Data Management              |

|                  Review Interface                  |
| :------------------------------------------------: |
| <img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/df629ee0-a5ca-4e47-b694-a94582dee7a0" />
|              Application Review Panel              |

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router

### Backend & Data

* Firebase Authentication
* Cloud Firestore

### Libraries

* `recharts` for charts
* `papaparse` for CSV parsing
* `lucide-react` for icons
* `firebase` SDK

## Getting Started

### Requirements

* Node.js (v18+ recommended)
* npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ESN-Porto/scholarship-website.git
   cd scholarship-website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

Start the local dev server:

```bash
npm run dev
```

The app runs at: **[http://localhost:5173](http://localhost:5173)**

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # UI components
│   ├── common/     # Shared components
│   └── ...         # Feature-specific components
├── context/        # Context providers
├── data/           # Static data
├── hooks/          # Custom hooks
├── services/       # Firebase and other service modules
├── utils/          # Helpers and utilities
├── App.jsx         # Root component
└── main.jsx        # Entry point
```
