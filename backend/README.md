# 🧪 RegressLab Backend API

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.5.1-orange.svg)](https://supabase.com)

The backend API for RegressLab - a high-performance machine learning platform built with FastAPI, featuring automated model selection, training, and prediction capabilities.

## 🚀 Features

- **🤖 Automated ML**: FLAML-powered automatic model selection and hyperparameter tuning
- **📊 Data Processing**: Comprehensive data preprocessing and validation
- **🔐 Secure Authentication**: JWT-based authentication with Supabase integration
- **💾 Model Persistence**: Secure model storage and retrieval
- **📈 Performance Metrics**: Comprehensive evaluation metrics (R², RMSE, MAE, etc.)
- **🔌 RESTful API**: Well-documented REST endpoints with automatic OpenAPI docs
- **⚡ High Performance**: Async/await support with Uvicorn ASGI server

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/                    # API layer
│   │   ├── routes/            # Route definitions
│   │   │   ├── datasets.py    # Dataset management
│   │   │   ├── train.py       # Model training
│   │   │   ├── predict.py     # Predictions
│   │   │   ├── history.py     # Training history
│   │   │   └── test_supabase.py # Health checks
│   │   ├── deps.py            # Dependency injection
│   │   └── errors.py          # Error handling
│   ├── core/                  # Core configuration
│   │   ├── config.py          # Settings management
│   │   ├── cors.py            # CORS configuration
│   │   └── security.py        # Authentication & security
│   ├── db/                    # Database layer
│   │   ├── models.py          # SQLModel definitions
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── repositories.py    # Data access layer
│   │   └── database.py        # Database connection
│   ├── services/              # Business logic
│   │   ├── ai_assistant.py    # AI-powered model selection
│   │   ├── training_service.py # Model training logic
│   │   ├── predict_service.py # Prediction logic
│   │   ├── evaluate_service.py # Model evaluation
│   │   ├── dataset_service.py # Dataset processing
│   │   └── data_preprocessing.py # Data preprocessing
│   └── utils/                 # Utilities
│       ├── file_utils.py      # File handling
│       └── metrics.py          # ML metrics
├── tests/                     # Test suite
├── requirements.txt          # Dependencies
├── main.py                   # Application entry point
├── uvicorn.toml             # Server configuration
└── README.md                # This file
```

## ⚙️ Tech Stack

### Core Framework

- **FastAPI** (0.115+) - Modern, fast web framework for building APIs
- **Uvicorn** - Lightning-fast ASGI server
- **Pydantic** (2.7+) - Data validation using Python type annotations

### Machine Learning

- **Scikit-learn** (1.4+) - Core ML algorithms and utilities
- **FLAML** (2.1+) - Automated machine learning framework
- **NumPy** (1.26+) - Numerical computing foundation
- **Pandas** (2.2+) - Data manipulation and analysis
- **Joblib** (1.4+) - Model serialization and persistence

### Database & Storage

- **Supabase** (2.5.1) - PostgreSQL database and file storage
- **SQLModel** (0.0.22+) - Type-safe ORM built on SQLAlchemy
- **SQLAlchemy** (2.0+) - Database toolkit and ORM

### Security & Authentication

- **python-jose** (3.3+) - JWT token handling
- **passlib** (1.7+) - Password hashing with bcrypt
- **httpx** (0.27+) - HTTP client for external API calls

### Configuration & Utilities

- **python-dotenv** (1.0+) - Environment variable management
- **python-multipart** (0.0.9+) - File upload handling
- **pydantic-settings** (2.4+) - Settings management

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

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

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip (Python package installer)
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/RegressLab.git
   cd RegressLab/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the application**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Verify Installation

- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Documentation

### Authentication

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer <supabase-jwt-token>
```

### Core Endpoints

#### Dataset Management

| Endpoint             | Method | Description      | Parameters                   |
| -------------------- | ------ | ---------------- | ---------------------------- |
| `/api/datasets`      | POST   | Upload dataset   | `file` (multipart/form-data) |
| `/api/datasets/{id}` | GET    | Get dataset info | `id` (path parameter)        |
| `/api/datasets/{id}` | DELETE | Delete dataset   | `id` (path parameter)        |

#### Model Training

| Endpoint          | Method | Description           | Parameters                           |
| ----------------- | ------ | --------------------- | ------------------------------------ |
| `/api/train`      | POST   | Train model           | `dataset_id`, `algorithm` (optional) |
| `/api/train/auto` | POST   | Auto-select and train | `dataset_id`                         |

#### Predictions

| Endpoint             | Method | Description       | Parameters           |
| -------------------- | ------ | ----------------- | -------------------- |
| `/api/predict`       | POST   | Make predictions  | `model_id`, `data`   |
| `/api/predict/batch` | POST   | Batch predictions | `model_id`, `data[]` |

#### History & Management

| Endpoint           | Method | Description          | Parameters            |
| ------------------ | ------ | -------------------- | --------------------- |
| `/api/history`     | GET    | Get training history | `limit`, `offset`     |
| `/api/models`      | GET    | List user models     | `limit`, `offset`     |
| `/api/models/{id}` | GET    | Get model details    | `id` (path parameter) |

### Example API Usage

#### Upload Dataset

```python
import requests

# Upload CSV file
with open('data.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/datasets',
        files={'file': f},
        headers={'Authorization': f'Bearer {token}'}
    )

dataset_id = response.json()['id']
```

#### Train Model

```python
# Auto-select algorithm
response = requests.post(
    'http://localhost:8000/api/train/auto',
    json={'dataset_id': dataset_id},
    headers={'Authorization': f'Bearer {token}'}
)

# Manual algorithm selection
response = requests.post(
    'http://localhost:8000/api/train',
    json={
        'dataset_id': dataset_id,
        'algorithm': 'random_forest'
    },
    headers={'Authorization': f'Bearer {token}'}
)

model_id = response.json()['model_id']
```

#### Make Predictions

```python
# Single prediction
response = requests.post(
    'http://localhost:8000/api/predict',
    json={
        'model_id': model_id,
        'data': [1.0, 2.0, 3.0, 4.0]
    },
    headers={'Authorization': f'Bearer {token}'}
)

prediction = response.json()['prediction']
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=app

# Run specific test file
python -m pytest tests/test_health.py

# Run with verbose output
python -m pytest tests/ -v
```

### Test Structure

```
tests/
├── __init__.py
├── test_health.py          # Health check tests
├── test_datasets.py        # Dataset endpoint tests
├── test_training.py       # Training endpoint tests
├── test_predictions.py     # Prediction endpoint tests
└── conftest.py            # Test configuration and fixtures
```

## 🔧 Development

### Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/

# Run all quality checks
black app/ && flake8 app/ && mypy app/
```

### Adding New Endpoints

1. **Create route file** in `app/api/routes/`
2. **Define schemas** in `app/db/schemas.py`
3. **Implement service logic** in `app/services/`
4. **Add tests** in `tests/`
5. **Update documentation**

### Database Migrations

```bash
# Generate migration (when Alembic is configured)
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🚀 Deployment

### Production Server

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment-Specific Configuration

```bash
# Development
ENVIRONMENT=development
DEBUG=true

# Production
ENVIRONMENT=production
DEBUG=false
```

## 📊 Performance Monitoring

### Metrics Collection

- **Response Times**: Track API endpoint performance
- **Model Training Time**: Monitor ML pipeline efficiency
- **Memory Usage**: Track resource utilization
- **Error Rates**: Monitor API reliability

### Logging

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 🔒 Security Best Practices

- **JWT Token Validation**: Verify all incoming tokens
- **Input Validation**: Validate all user inputs
- **File Upload Security**: Scan uploaded files
- **Rate Limiting**: Implement API rate limiting
- **CORS Configuration**: Restrict cross-origin requests
- **Environment Variables**: Never commit secrets

## 🐛 Troubleshooting

### Common Issues

1. **ImportError: No module named 'httpx'**

   ```bash
   pip install httpx
   ```

2. **Supabase Connection Error**

   - Verify environment variables
   - Check Supabase project status
   - Ensure proper network connectivity

3. **Model Training Fails**
   - Check dataset format (CSV required)
   - Verify data quality
   - Ensure sufficient memory

### Debug Mode

```bash
# Enable debug logging
ENVIRONMENT=development
DEBUG=true

# Run with debug output
uvicorn main:app --reload --log-level debug
```

## 📈 Performance Optimization

- **Async Operations**: Use async/await for I/O operations
- **Connection Pooling**: Implement database connection pooling
- **Caching**: Add Redis caching for frequently accessed data
- **Model Optimization**: Use model compression techniques
- **Batch Processing**: Implement batch prediction endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Write comprehensive tests
- Update API documentation
- Use type hints throughout
- Follow FastAPI best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🌐 Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **Supabase Documentation**: https://supabase.com/docs
- **FLAML Documentation**: https://microsoft.github.io/FLAML/
- **Scikit-learn Documentation**: https://scikit-learn.org

---

⭐ **Star this repository** if you found it helpful!
