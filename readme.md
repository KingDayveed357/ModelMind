# 🧪 RegressLab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)

RegressLab is an AI-powered machine learning platform that helps users train, evaluate, and deploy models with ease. It started as a regression-focused system and has now expanded to support a wide range of algorithms — all powered by FastAPI, Next.js, and Supabase.

## 🚀 Overview

RegressLab makes machine learning accessible by simplifying the end-to-end workflow — from data upload to model selection, training, evaluation, and prediction.

### Key Features

- **📊 Dataset Management**: Upload datasets directly to Supabase Storage with automatic validation
- **🤖 Automatic Model Selection**: AI-powered analysis to select the best algorithm for your data
- **🔧 Custom Training**: Manual algorithm selection with hyperparameter tuning capabilities
- **📈 Performance Evaluation**: Comprehensive metrics visualization with interactive charts
- **💾 Model Persistence**: Save, retrieve, and deploy trained models via REST API
- **🔐 Secure Authentication**: Built-in user management with Supabase Auth
- **📱 Modern UI**: Responsive dashboard with dark/light theme support

### Target Audience

- **Data Scientists**: Experimenting with ML algorithms and model comparison
- **Students**: Learning machine learning concepts through hands-on practice
- **Developers**: Integrating machine learning capabilities into applications
- **Teams**: Seeking reproducible training and model comparison workflows

## 🏗️ Project Structure

```
RegressLab/
│
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API routes and dependencies
│   │   │   ├── routes/        # Endpoint definitions
│   │   │   ├── deps.py        # Dependency injection
│   │   │   └── errors.py      # Error handling
│   │   ├── core/              # Core configuration and utilities
│   │   │   ├── config.py      # Settings and environment variables
│   │   │   ├── cors.py        # CORS configuration
│   │   │   └── security.py    # Authentication and security
│   │   ├── db/                # Database models and schemas
│   │   │   ├── models.py      # SQLModel definitions
│   │   │   ├── schemas.py     # Pydantic schemas
│   │   │   └── repositories.py # Data access layer
│   │   ├── services/          # Business logic services
│   │   │   ├── ai_assistant.py # AI-powered model selection
│   │   │   ├── training_service.py # Model training logic
│   │   │   ├── predict_service.py # Prediction endpoints
│   │   │   └── evaluate_service.py # Model evaluation
│   │   └── utils/             # Utility functions
│   │       ├── file_utils.py  # File handling utilities
│   │       └── metrics.py     # ML metrics calculations
│   ├── tests/                 # Test suite
│   ├── requirements.txt       # Python dependencies
│   ├── main.py               # Application entry point
│   ├── uvicorn.toml          # Uvicorn configuration
│   └── README.md             # Backend documentation
│
├── frontend/                  # Next.js frontend application
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── upload/       # Dataset upload interface
│   │   │   ├── train/        # Model training interface
│   │   │   ├── predictions/  # Prediction interface
│   │   │   ├── visualizations/ # Charts and metrics
│   │   │   ├── history/      # Training history
│   │   │   ├── models/       # Model management
│   │   │   ├── assistant/    # AI assistant interface
│   │   │   └── settings/     # User settings
│   │   ├── sign-in/          # Authentication pages
│   │   ├── sign-up/
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   └── ...               # Other components
│   ├── lib/                  # Utility libraries
│   ├── hooks/                # Custom React hooks
│   ├── styles/               # Global styles
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   ├── next.config.mjs       # Next.js configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── README.md             # Frontend documentation
│
├── .gitignore               # Git ignore rules
├── README.md                # Main documentation (this file)
└── LICENSE                  # MIT License
```

## ⚙️ Tech Stack

### 🧩 Backend

**Core Framework**

- **FastAPI** (0.115+) – High-performance Python web framework with automatic API documentation
- **Uvicorn** – ASGI server for production deployment
- **Pydantic** (2.7+) – Data validation and settings management

**Database & Storage**

- **Supabase** (2.5.1) – PostgreSQL database, authentication, and file storage
- **SQLModel** (0.0.22+) – Type-safe ORM built on SQLAlchemy
- **SQLAlchemy** (2.0+) – Database toolkit and ORM

**Machine Learning**

- **Scikit-learn** (1.4+) – Core ML algorithms (LinearRegression, RandomForest, SVM, etc.)
- **FLAML** (2.1+) – Automated machine learning framework
- **NumPy** (1.26+) – Numerical computing foundation
- **Pandas** (2.2+) – Data manipulation and analysis
- **Joblib** (1.4+) – Model serialization and persistence

**Security & Authentication**

- **python-jose** (3.3+) – JWT token handling
- **passlib** (1.7+) – Password hashing with bcrypt
- **httpx** (0.27+) – HTTP client for external API calls

**Configuration & Utilities**

- **python-dotenv** (1.0+) – Environment variable management
- **python-multipart** (0.0.9+) – File upload handling

### 💻 Frontend

**Core Framework**

- **Next.js** (14.2+) – React framework with App Router
- **React** (18+) – UI library with hooks and modern patterns
- **TypeScript** (5+) – Type-safe JavaScript development

**Styling & UI**

- **Tailwind CSS** (4.1+) – Utility-first CSS framework
- **shadcn/ui** – High-quality, accessible React components
- **Radix UI** – Unstyled, accessible UI primitives
- **Lucide React** – Beautiful, customizable icons
- **next-themes** – Dark/light theme support

**Data Visualization**

- **Recharts** – Composable charting library for React
- **React Hook Form** (7.60+) – Performant forms with validation
- **Zod** (3.25+) – TypeScript-first schema validation

**Authentication & API**

- **Supabase JS Client** (2.75+) – Client library for Supabase services
- **@supabase/auth-helpers-nextjs** (0.10+) – Next.js authentication helpers
- **@supabase/ssr** (0.7+) – Server-side rendering support

**Development Tools**

- **ESLint** – Code linting and formatting
- **PostCSS** (8.5+) – CSS processing
- **Autoprefixer** (10.4+) – CSS vendor prefixing

## 🧠 Core Features

- **✅ Automatic Model Selection**: AI-powered analysis identifies dataset type (regression/classification) and selects optimal algorithms
- **✅ Supabase Integration**: Seamless database, storage, and authentication management
- **✅ Custom Model Training**: Manual algorithm selection with hyperparameter tuning capabilities
- **✅ Performance Evaluation**: Comprehensive metrics visualization with interactive charts (R², RMSE, MAE, confusion matrix)
- **✅ Model Persistence**: Secure storage and retrieval of trained models via REST API
- **✅ Real-time Predictions**: Live inference endpoints for production use
- **✅ User Management**: Secure authentication and user-specific model isolation

## 🔧 Environment Variables

Both frontend and backend require Supabase configuration. Create the following environment files:

### Backend Environment (`backend/.env`)

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/keys

# Application Settings
APP_NAME=RegressLab API
ENVIRONMENT=development
SECRET_KEY=your-secret-key-for-jwt-signing

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000"]

# Optional: OpenAI Integration
OPENAI_API_KEY=your-openai-api-key

# Database (if using external PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/regresslab
```

### Frontend Environment (`frontend/.env.local`)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## ⚙️ Setup Instructions

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Supabase Account** ([Sign up here](https://supabase.com))
- **Git** for version control

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/RegressLab.git
cd RegressLab
```

### 2️⃣ Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to get your project URL and anon key
3. Go to **Settings > API** to get your service role key
4. Create a storage bucket named `regresslab-data` in **Storage**

### 3️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip to latest version
pip install --upgrade pip

# Install dependencies (this will install httpx and all other required packages)
pip install -r requirements.txt

# Create environment file
cp env.example .env
# Edit .env with your Supabase credentials

# Verify installation by checking httpx
python -c "import httpx; print('httpx installed successfully')"

# Run the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URLs:**

- API Base: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 4️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Verify installation
npm run build

# Start development server
npm run dev
```

**Frontend URL:** http://localhost:3000

### 5️⃣ Verify Installation

1. **Backend Health Check**: Visit http://localhost:8000/health
2. **Frontend**: Visit http://localhost:3000
3. **API Documentation**: Visit http://localhost:8000/docs
4. **Test Authentication**: Try signing up at http://localhost:3000/sign-up

### 🔧 Troubleshooting

#### Common Issues

**"ModuleNotFoundError: No module named 'httpx'"**

```bash
# Solution: Make sure you've activated your virtual environment and installed dependencies
cd backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

**"Supabase connection error"**

- Verify your `.env` file has correct Supabase credentials
- Check that your Supabase project is active
- Ensure the storage bucket `regresslab-data` exists

**"Frontend build errors"**

```bash
# Clear Next.js cache and reinstall
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

**"CORS errors"**

- Ensure `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Check that both frontend and backend are running on correct ports

## 🧮 Typical Workflow

1. **🔐 Authentication**: Sign up/log in via Supabase Auth
2. **📊 Data Upload**: Upload dataset → stored securely in Supabase Storage
3. **🤖 Model Selection**: Auto-select or manually choose algorithm → Backend analyzes dataset
4. **🏋️ Training**: Train model → Generates performance metrics and saves model
5. **📈 Evaluation**: View results → Interactive charts displayed via Recharts
6. **🚀 Deployment**: Use trained model → Make predictions via REST API

## 📈 Architecture Overview

```
┌────────────────────────────┐
│        Frontend (Next.js)  │
│   - UI / Charts / Upload   │
│   - Auth via Supabase      │
│   - Real-time Updates      │
└──────────────┬─────────────┘
               │  REST API
               ▼
┌────────────────────────────┐
│         Backend (FastAPI)  │
│  - Data preprocessing      │
│  - Model training          │
│  - Auto model selection    │
│  - Prediction endpoints    │
│  - JWT Authentication      │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│        Supabase            │
│  - Auth (Users)            │
│  - Database (Metadata)     │
│  - Storage (Files/Models)  │
│  - Real-time subscriptions │
└────────────────────────────┘
```

## 🚀 Deployment

### Frontend Deployment (Vercel - Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all variables from `frontend/.env.local`
3. **Build Settings**: Vercel auto-detects Next.js configuration
4. **Deploy**: Automatic deployment on every push to main branch

**Vercel Configuration:**

```bash
# vercel.json (optional)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Backend Deployment Options

#### Option 1: Railway

1. Connect GitHub repository
2. Add environment variables
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Option 2: Render

1. Create new Web Service
2. Connect repository
3. Add environment variables
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Option 3: Supabase Edge Functions

1. Install Supabase CLI
2. Create edge function: `supabase functions new regresslab-api`
3. Deploy: `supabase functions deploy regresslab-api`

### Production Environment Variables

Update your production environment variables:

- Change `NEXT_PUBLIC_API_URL` to your deployed backend URL
- Ensure `CORS_ORIGINS` includes your frontend domain
- Set `ENVIRONMENT=production`

## 🧪 API Documentation

### Core Endpoints

| Endpoint             | Method | Description              |
| -------------------- | ------ | ------------------------ |
| `/api/datasets`      | POST   | Upload dataset           |
| `/api/datasets/{id}` | GET    | Get dataset info         |
| `/api/train`         | POST   | Train model              |
| `/api/predict`       | POST   | Make predictions         |
| `/api/history`       | GET    | Get training history     |
| `/api/test/supabase` | GET    | Test Supabase connection |

### Authentication

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer <supabase-jwt-token>
```

### Example API Usage

```python
import requests

# Upload dataset
with open('data.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/datasets',
        files={'file': f},
        headers={'Authorization': f'Bearer {token}'}
    )

# Train model
response = requests.post(
    'http://localhost:8000/api/train',
    json={'dataset_id': 'dataset-uuid', 'algorithm': 'random_forest'},
    headers={'Authorization': f'Bearer {token}'}
)
```

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests (if configured)
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
black app/
flake8 app/
mypy app/

# Frontend linting
cd frontend
npm run lint
```

### Database Migrations

```bash
# If using Alembic (when implemented)
cd backend
alembic upgrade head
```

## 📈 Future Plans

- **🔍 Model Explainability**: SHAP, LIME integration for model interpretation
- **📊 Real-time Training**: Live training progress and metrics streaming
- **🔄 Multi-model Comparison**: Side-by-side model performance comparison
- **⚙️ Hyperparameter Tuning**: Automated hyperparameter optimization
- **☁️ Cloud Inference**: Scalable cloud-based prediction API
- **🔗 AutoML Pipeline**: Visual pipeline builder for complex workflows
- **📱 Mobile App**: React Native mobile application
- **🌐 Multi-tenancy**: Organization and team management features

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links & Resources

- **Live Demo**: [Frontend Deployment](https://your-vercel-app.vercel.app)
- **API Documentation**: [Interactive Docs](http://localhost:8000/docs)
- **Supabase**: [Documentation](https://supabase.com/docs)
- **FastAPI**: [Documentation](https://fastapi.tiangolo.com)
- **Next.js**: [Documentation](https://nextjs.org/docs)

## 👨‍💻 Author

**David Aniago**

- GitHub: [@KingDayveed357](https://github.com/KingDayveed357)
- LinkedIn: [David Aniago](https://www.linkedin.com/in/aniago-david-225746323)
- Email: davidaniago@gmail.com

---

⭐ **Star this repository** if you found it helpful!
