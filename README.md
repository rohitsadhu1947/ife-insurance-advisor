# Life Insurance Advisor - Indian Market Focus

A comprehensive Life Insurance Advisor system designed specifically for the Indian market, providing intelligent insurance recommendations, needs analysis, and product comparisons.

## 🚀 Features

### Core Features
- **Insurance Needs Analysis**: Calculate comprehensive insurance needs based on Indian family dynamics
- **Product Comparison**: Compare insurance products from major Indian insurers
- **Premium Calculator**: Calculate premiums with inflation-adjusted returns
- **Recommendation Engine**: AI-powered personalized insurance recommendations
- **PDF Report Generation**: Professional reports for customer sharing
- **Indian Market Focus**: Tailored for Indian customer psyche and market conditions

### Insurance Products Covered
- Term Life Insurance
- Endowment Plans
- Money Back Plans
- Whole Life Insurance
- ULIPs (Unit Linked Insurance Plans)
- Child Plans
- Pension Plans
- Critical Illness Insurance
- Disability Insurance

### Indian Insurers Included
- LIC of India
- HDFC Life
- ICICI Prudential Life
- SBI Life
- Max Life
- And more...

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Database ORM with async support
- **PostgreSQL**: Primary database (Neon DB)
- **Pydantic**: Data validation and serialization
- **ReportLab**: PDF generation
- **Python 3.9+**: Core language

### Frontend (Coming Soon)
- React.js with TypeScript
- Modern UI/UX design
- Responsive design for mobile and desktop

## 📋 Prerequisites

- Python 3.9 or higher
- PostgreSQL database (Neon DB recommended)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rohitsadhu1947/ife-insurance-advisor.git
cd ife-insurance-advisor
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
```

#### Database Setup
```bash
# Initialize database with sample data
python init_db.py
```

#### Run the Application
```bash
# Development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Access the API
- API Documentation: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 📚 API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /health` - Health check

### Insurers
- `GET /insurers/` - Get all insurance companies
- `GET /insurers/{id}` - Get specific insurer details

### Products
- `GET /products/` - Get all products (with filtering)
- `GET /products/{id}` - Get specific product details
- `POST /products/compare/` - Compare multiple products

### Customers
- `POST /customers/` - Create new customer
- `GET /customers/{id}` - Get customer details
- `PUT /customers/{id}` - Update customer information

### Calculator
- `POST /calculator/needs-analysis/` - Calculate insurance needs
- `POST /calculator/premium/` - Calculate premium for specific product

### Needs Analysis
- `POST /needs-analysis/` - Create needs analysis
- `GET /needs-analysis/{customer_id}` - Get customer's needs analysis

### Recommendations
- `POST /recommendations/generate/` - Generate recommendations
- `GET /recommendations/{customer_id}` - Get customer's recommendations

### Reports
- `POST /reports/generate/` - Generate PDF report
- `GET /reports/{customer_id}` - Get customer's reports

### Market Data
- `GET /market-data/` - Get current market data

## 💡 Usage Examples

### 1. Create a Customer
```bash
curl -X POST "http://localhost:8000/customers/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "+91-9876543210",
    "age": 30,
    "gender": "male",
    "occupation": "Software Engineer",
    "annual_income": 1200000,
    "family_size": 4,
    "dependents": 2
  }'
```

### 2. Calculate Insurance Needs
```bash
curl -X POST "http://localhost:8000/calculator/needs-analysis/" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "calculation_type": "comprehensive",
    "age": 30,
    "gender": "male",
    "annual_income": 1200000,
    "family_size": 4,
    "dependents": 2,
    "existing_coverage": 500000,
    "debt_obligations": 2000000,
    "children_education_needs": 3000000,
    "retirement_needs": 5000000
  }'
```

### 3. Generate Recommendations
```bash
curl -X POST "http://localhost:8000/recommendations/generate/" \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1}'
```

## 🏗️ Project Structure

```
ife-insurance-advisor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── services.py          # Business logic
│   ├── pdf_service.py       # PDF generation
│   ├── init_db.py           # Database initialization
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/                # React frontend (coming soon)
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `DEBUG`: Enable debug mode (default: False)
- `SECRET_KEY`: Application secret key

### Database Configuration
The system uses PostgreSQL with the following features:
- Async database operations
- Connection pooling
- Automatic migrations
- Sample data for Indian insurers

## 📊 Sample Data

The system comes pre-loaded with:
- 5 major Indian insurance companies
- 4 sample insurance products
- Premium rate tables
- Market data

## 🚀 Deployment

### Vercel Deployment
The project is configured for Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Local Development
```bash
# Run with hot reload
uvicorn main:app --reload

# Run with specific host and port
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: rohit@example.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Backend API development
- ✅ Database design and implementation
- ✅ Core calculation services
- ✅ PDF report generation

### Phase 2 (Next)
- 🚧 React frontend development
- 🚧 Advanced UI/UX design
- 🚧 Real-time notifications
- 🚧 Mobile app development

### Phase 3 (Future)
- 📋 AI-powered recommendations
- 📋 Integration with insurance APIs
- 📋 Advanced analytics dashboard
- 📋 Multi-language support

## 🙏 Acknowledgments

- Indian insurance market data sources
- FastAPI community
- SQLAlchemy documentation
- ReportLab for PDF generation

---

**Built with ❤️ for the Indian Insurance Market** 