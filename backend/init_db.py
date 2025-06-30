import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, SessionLocal
from models import Base, Insurer, Product, ProductPerformance, PremiumRate, MarketData
from datetime import date

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with SessionLocal() as db:
        # Check if data already exists
        existing_insurers = await db.get(Insurer, 1)
        if existing_insurers:
            print("Database already initialized with sample data")
            return
        
        # Sample Indian Insurance Companies
        insurers_data = [
            {
                "name": "LIC of India",
                "logo_url": "https://example.com/lic-logo.png",
                "website": "https://www.lic.in",
                "customer_care": "1800-425-5425",
                "claim_settlement_ratio": 98.31,
                "solvency_ratio": 1.76,
                "irda_registration": "512",
                "established_year": 1956,
                "headquarters": "Mumbai, Maharashtra",
                "rating": 4.5,
                "rating_agency": "CRISIL"
            },
            {
                "name": "HDFC Life",
                "logo_url": "https://example.com/hdfc-life-logo.png",
                "website": "https://www.hdfclife.com",
                "customer_care": "1800-266-9777",
                "claim_settlement_ratio": 99.04,
                "solvency_ratio": 1.87,
                "irda_registration": "101",
                "established_year": 2000,
                "headquarters": "Mumbai, Maharashtra",
                "rating": 4.3,
                "rating_agency": "ICRA"
            },
            {
                "name": "ICICI Prudential Life",
                "logo_url": "https://example.com/icici-pru-logo.png",
                "website": "https://www.iciciprulife.com",
                "customer_care": "1800-266-7666",
                "claim_settlement_ratio": 98.58,
                "solvency_ratio": 2.01,
                "irda_registration": "105",
                "established_year": 2000,
                "headquarters": "Mumbai, Maharashtra",
                "rating": 4.4,
                "rating_agency": "CRISIL"
            },
            {
                "name": "SBI Life",
                "logo_url": "https://example.com/sbi-life-logo.png",
                "website": "https://www.sbilife.co.in",
                "customer_care": "1800-267-9090",
                "claim_settlement_ratio": 98.03,
                "solvency_ratio": 1.92,
                "irda_registration": "111",
                "established_year": 2001,
                "headquarters": "Mumbai, Maharashtra",
                "rating": 4.2,
                "rating_agency": "ICRA"
            },
            {
                "name": "Max Life",
                "logo_url": "https://example.com/max-life-logo.png",
                "website": "https://www.maxlifeinsurance.com",
                "customer_care": "1800-200-5577",
                "claim_settlement_ratio": 99.34,
                "solvency_ratio": 1.95,
                "irda_registration": "104",
                "established_year": 2000,
                "headquarters": "New Delhi",
                "rating": 4.1,
                "rating_agency": "CRISIL"
            }
        ]
        
        # Create insurers
        insurers = []
        for insurer_data in insurers_data:
            insurer = Insurer(**insurer_data)
            db.add(insurer)
            insurers.append(insurer)
        
        await db.commit()
        
        # Sample Products
        products_data = [
            {
                "name": "LIC Jeevan Anand",
                "insurer_id": 1,
                "product_type": "endowment",
                "description": "A participating endowment plan that provides financial protection and savings",
                "features": ["Death benefit", "Maturity benefit", "Bonus", "Loan facility"],
                "benefits": ["Life cover till 100 years", "Guaranteed additions", "Loyalty additions"],
                "exclusions": ["Suicide within 12 months", "Pre-existing diseases"],
                "min_age": 18,
                "max_age": 50,
                "min_sum_assured": 100000,
                "max_sum_assured": 50000000,
                "min_premium": 5000,
                "max_premium": 100000,
                "premium_frequency": "yearly",
                "policy_term_options": [15, 20, 25, 30, 35],
                "premium_paying_term_options": [15, 20, 25, 30, 35]
            },
            {
                "name": "HDFC Click 2 Protect",
                "insurer_id": 2,
                "product_type": "term_life",
                "description": "Pure term insurance plan with high coverage at low premium",
                "features": ["High sum assured", "Low premium", "Multiple riders"],
                "benefits": ["Death benefit", "Critical illness rider", "Accidental death rider"],
                "exclusions": ["Suicide within 12 months", "Pre-existing conditions"],
                "min_age": 18,
                "max_age": 65,
                "min_sum_assured": 25000000,
                "max_sum_assured": 100000000,
                "min_premium": 3000,
                "max_premium": 50000,
                "premium_frequency": "yearly",
                "policy_term_options": [10, 15, 20, 25, 30],
                "premium_paying_term_options": [10, 15, 20, 25, 30]
            },
            {
                "name": "ICICI Pru iProtect Smart",
                "insurer_id": 3,
                "product_type": "term_life",
                "description": "Term insurance with return of premium option",
                "features": ["Death benefit", "Return of premium", "Multiple riders"],
                "benefits": ["Life cover", "Premium return on survival", "Tax benefits"],
                "exclusions": ["Suicide within 12 months", "Pre-existing diseases"],
                "min_age": 18,
                "max_age": 65,
                "min_sum_assured": 5000000,
                "max_sum_assured": 50000000,
                "min_premium": 2000,
                "max_premium": 30000,
                "premium_frequency": "yearly",
                "policy_term_options": [10, 15, 20, 25, 30],
                "premium_paying_term_options": [10, 15, 20, 25, 30]
            },
            {
                "name": "SBI Life Smart Humsafar",
                "insurer_id": 4,
                "product_type": "ulip",
                "description": "Unit Linked Insurance Plan with multiple fund options",
                "features": ["Life cover", "Investment options", "Fund switching"],
                "benefits": ["Life protection", "Wealth creation", "Flexibility"],
                "exclusions": ["Suicide within 12 months", "Pre-existing conditions"],
                "min_age": 18,
                "max_age": 65,
                "min_sum_assured": 1000000,
                "max_sum_assured": 100000000,
                "min_premium": 12000,
                "max_premium": 100000,
                "premium_frequency": "yearly",
                "policy_term_options": [10, 15, 20, 25, 30],
                "premium_paying_term_options": [5, 10, 15, 20, 25]
            }
        ]
        
        # Create products
        products = []
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
            products.append(product)
        
        await db.commit()
        
        # Sample Premium Rates
        premium_rates_data = [
            # LIC Jeevan Anand rates (per 1000 sum assured)
            {"product_id": 1, "age": 25, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 1000000, "premium_rate": 45.50},
            {"product_id": 1, "age": 30, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 1000000, "premium_rate": 52.30},
            {"product_id": 1, "age": 35, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 1000000, "premium_rate": 60.20},
            {"product_id": 1, "age": 25, "gender": "female", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 1000000, "premium_rate": 42.10},
            
            # HDFC Click 2 Protect rates
            {"product_id": 2, "age": 25, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 25000000, "premium_rate": 0.85},
            {"product_id": 2, "age": 30, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 25000000, "premium_rate": 1.05},
            {"product_id": 2, "age": 35, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 25000000, "premium_rate": 1.35},
            
            # ICICI Pru iProtect Smart rates
            {"product_id": 3, "age": 25, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 5000000, "premium_rate": 0.95},
            {"product_id": 3, "age": 30, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 5000000, "premium_rate": 1.15},
            {"product_id": 3, "age": 35, "gender": "male", "policy_term": 20, "premium_paying_term": 20, "sum_assured": 5000000, "premium_rate": 1.45}
        ]
        
        for rate_data in premium_rates_data:
            premium_rate = PremiumRate(**rate_data)
            db.add(premium_rate)
        
        # Sample Market Data for each insurer
        market_data_list = [
            {
                "insurer_id": 1,  # LIC
                "date": date.today(),
                "claim_settlement_ratio": 98.31,
                "rating": 4.5,
                "market_share": 25.5,
                "premium_growth": 12.3,
                "customer_satisfaction": 4.2,
                "inflation_rate": 6.5,
                "repo_rate": 6.5,
                "gdp_growth": 7.2,
                "market_cap": 3500000.0
            },
            {
                "insurer_id": 2,  # HDFC Life
                "date": date.today(),
                "claim_settlement_ratio": 99.04,
                "rating": 4.3,
                "market_share": 18.2,
                "premium_growth": 15.7,
                "customer_satisfaction": 4.4,
                "inflation_rate": 6.5,
                "repo_rate": 6.5,
                "gdp_growth": 7.2,
                "market_cap": 2800000.0
            },
            {
                "insurer_id": 3,  # ICICI Prudential
                "date": date.today(),
                "claim_settlement_ratio": 98.58,
                "rating": 4.4,
                "market_share": 16.8,
                "premium_growth": 14.2,
                "customer_satisfaction": 4.3,
                "inflation_rate": 6.5,
                "repo_rate": 6.5,
                "gdp_growth": 7.2,
                "market_cap": 2500000.0
            },
            {
                "insurer_id": 4,  # SBI Life
                "date": date.today(),
                "claim_settlement_ratio": 98.03,
                "rating": 4.2,
                "market_share": 12.5,
                "premium_growth": 11.8,
                "customer_satisfaction": 4.1,
                "inflation_rate": 6.5,
                "repo_rate": 6.5,
                "gdp_growth": 7.2,
                "market_cap": 1800000.0
            },
            {
                "insurer_id": 5,  # Max Life
                "date": date.today(),
                "claim_settlement_ratio": 99.34,
                "rating": 4.1,
                "market_share": 8.7,
                "premium_growth": 13.5,
                "customer_satisfaction": 4.0,
                "inflation_rate": 6.5,
                "repo_rate": 6.5,
                "gdp_growth": 7.2,
                "market_cap": 1200000.0
            }
        ]
        
        for market_data_item in market_data_list:
            market_data = MarketData(**market_data_item)
            db.add(market_data)
        
        await db.commit()
        print("Database initialized successfully with sample Indian insurance data!")

if __name__ == "__main__":
    asyncio.run(init_db()) 