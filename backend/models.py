from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class ProductType(str, enum.Enum):
    TERM_LIFE = "term_life"
    ENDOWMENT = "endowment"
    MONEY_BACK = "money_back"
    WHOLE_LIFE = "whole_life"
    ULIP = "ulip"
    CHILD_PLANS = "child_plans"
    PENSION_PLANS = "pension_plans"
    CRITICAL_ILLNESS = "critical_illness"
    DISABILITY = "disability"

class Insurer(Base):
    __tablename__ = "insurers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    logo_url = Column(String(255))
    website = Column(String(255))
    customer_care = Column(String(100))
    claim_settlement_ratio = Column(Float)
    solvency_ratio = Column(Float)
    irda_registration = Column(String(50))
    established_year = Column(Integer)
    headquarters = Column(String(100))
    rating = Column(Float)
    rating_agency = Column(String(50))
    products = relationship("Product", back_populates="insurer")
    market_data = relationship("MarketData", back_populates="insurer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    insurer_id = Column(Integer, ForeignKey("insurers.id"))
    product_type = Column(String(50))
    description = Column(Text)
    features = Column(JSON)
    benefits = Column(JSON)
    exclusions = Column(JSON)
    min_age = Column(Integer)
    max_age = Column(Integer)
    min_sum_assured = Column(Float)
    max_sum_assured = Column(Float)
    min_premium = Column(Float)
    max_premium = Column(Float)
    premium_frequency = Column(String(50))  # monthly, quarterly, yearly
    policy_term_options = Column(JSON)  # [10, 15, 20, 25, 30]
    premium_paying_term_options = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    insurer = relationship("Insurer", back_populates="products")
    performance_metrics = relationship("ProductPerformance", back_populates="product")
    premium_rates = relationship("PremiumRate", back_populates="product")

class ProductPerformance(Base):
    __tablename__ = "product_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    year = Column(Integer)
    quarter = Column(Integer)
    fund_value = Column(Float)
    nav = Column(Float)
    returns_1y = Column(Float)
    returns_3y = Column(Float)
    returns_5y = Column(Float)
    returns_since_inception = Column(Float)
    benchmark_return = Column(Float)
    expense_ratio = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="performance_metrics")

class PremiumRate(Base):
    __tablename__ = "premium_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    age = Column(Integer)
    gender = Column(String(10))
    policy_term = Column(Integer)
    premium_paying_term = Column(Integer)
    sum_assured = Column(Float)
    premium_rate = Column(Float)  # per 1000 sum assured
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="premium_rates")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(15))
    date_of_birth = Column(Date)
    age = Column(Integer)
    gender = Column(String(10))
    occupation = Column(String(100))
    annual_income = Column(Float)
    family_size = Column(Integer)
    dependents = Column(Integer)
    existing_insurance = Column(JSON)
    health_conditions = Column(JSON)
    lifestyle_factors = Column(JSON)
    risk_appetite = Column(String(20))  # low, medium, high
    investment_goals = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    needs_analysis = relationship("NeedsAnalysis", back_populates="customer")
    recommendations = relationship("Recommendation", back_populates="customer")

class NeedsAnalysis(Base):
    __tablename__ = "needs_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    human_life_value = Column(Float)
    income_replacement_needs = Column(Float)
    debt_obligations = Column(Float)
    children_education_needs = Column(Float)
    retirement_needs = Column(Float)
    emergency_fund_needs = Column(Float)
    total_insurance_needs = Column(Float)
    existing_coverage = Column(Float)
    additional_coverage_needed = Column(Float)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer", back_populates="needs_analysis")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    sum_assured = Column(Float)
    premium_amount = Column(Float)
    policy_term = Column(Integer)
    premium_paying_term = Column(Integer)
    premium_frequency = Column(String(20))
    reasoning = Column(Text)
    priority = Column(String(20))  # high, medium, low
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer", back_populates="recommendations")
    product = relationship("Product")

class InsuranceCalculator(Base):
    __tablename__ = "insurance_calculators"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    calculation_type = Column(String(50))  # term_insurance, endowment, ulip
    inputs = Column(JSON)
    results = Column(JSON)
    inflation_rate = Column(Float, default=6.0)
    return_rate = Column(Float, default=8.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    report_type = Column(String(50))  # needs_analysis, product_comparison, recommendation
    content = Column(JSON)
    pdf_url = Column(String(255))
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer")

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    insurer_id = Column(Integer, ForeignKey("insurers.id"))
    date = Column(Date)
    claim_settlement_ratio = Column(Float)
    rating = Column(Float)
    market_share = Column(Float)
    premium_growth = Column(Float)
    customer_satisfaction = Column(Float)
    inflation_rate = Column(Float)
    repo_rate = Column(Float)
    gdp_growth = Column(Float)
    market_cap = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    insurer = relationship("Insurer", back_populates="market_data")
