from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum

class ProductType(str, Enum):
    TERM_LIFE = "term_life"
    ENDOWMENT = "endowment"
    MONEY_BACK = "money_back"
    WHOLE_LIFE = "whole_life"
    ULIP = "ulip"
    CHILD_PLANS = "child_plans"
    PENSION_PLANS = "pension_plans"
    CRITICAL_ILLNESS = "critical_illness"
    DISABILITY = "disability"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class RiskAppetite(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

# Insurer Schemas
class InsurerBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    customer_care: Optional[str] = None
    claim_settlement_ratio: Optional[float] = None
    solvency_ratio: Optional[float] = None
    irda_registration: Optional[str] = None
    established_year: Optional[int] = None
    headquarters: Optional[str] = None
    rating: Optional[float] = None
    rating_agency: Optional[str] = None

class InsurerCreate(InsurerBase):
    pass

class Insurer(InsurerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    insurer_id: int
    product_type: str
    description: Optional[str] = None
    features: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_sum_assured: Optional[float] = None
    max_sum_assured: Optional[float] = None
    min_premium: Optional[float] = None
    max_premium: Optional[float] = None
    premium_frequency: Optional[str] = None
    policy_term_options: Optional[List[int]] = None
    premium_paying_term_options: Optional[List[int]] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    insurer: Insurer

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    family_size: Optional[int] = None
    dependents: Optional[int] = None
    existing_insurance: Optional[Dict[str, Any]] = None
    health_conditions: Optional[List[str]] = None
    lifestyle_factors: Optional[List[str]] = None
    risk_appetite: Optional[RiskAppetite] = None
    investment_goals: Optional[List[str]] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    family_size: Optional[int] = None
    dependents: Optional[int] = None
    existing_insurance: Optional[Dict[str, Any]] = None
    health_conditions: Optional[List[str]] = None
    lifestyle_factors: Optional[List[str]] = None
    risk_appetite: Optional[RiskAppetite] = None
    investment_goals: Optional[List[str]] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Needs Analysis Schemas
class NeedsAnalysisBase(BaseModel):
    human_life_value: Optional[float] = None
    income_replacement_needs: Optional[float] = None
    debt_obligations: Optional[float] = None
    children_education_needs: Optional[float] = None
    retirement_needs: Optional[float] = None
    emergency_fund_needs: Optional[float] = None
    total_insurance_needs: Optional[float] = None
    existing_coverage: Optional[float] = None
    additional_coverage_needed: Optional[float] = None

class NeedsAnalysisCreate(NeedsAnalysisBase):
    customer_id: int

class NeedsAnalysis(NeedsAnalysisBase):
    id: int
    customer_id: int
    analysis_date: datetime

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationBase(BaseModel):
    product_id: int
    sum_assured: float
    premium_amount: float
    policy_term: int
    premium_paying_term: int
    premium_frequency: str
    reasoning: str
    priority: Priority

class RecommendationCreate(RecommendationBase):
    customer_id: int

class Recommendation(RecommendationBase):
    id: int
    customer_id: int
    created_at: datetime
    product: Product

    class Config:
        from_attributes = True

# Calculator Schemas
class CalculatorInput(BaseModel):
    customer_id: int
    calculation_type: str
    age: int
    gender: Gender
    annual_income: float
    family_size: int
    dependents: int
    existing_coverage: Optional[float] = 0
    debt_obligations: Optional[float] = 0
    children_education_needs: Optional[float] = 0
    retirement_needs: Optional[float] = 0
    inflation_rate: float = 6.0
    return_rate: float = 8.0

class CalculatorResult(BaseModel):
    human_life_value: float
    recommended_coverage: float
    additional_coverage_needed: float
    premium_estimates: Dict[str, float]
    inflation_adjusted_returns: Dict[str, float]

# Premium Rate Schemas
class PremiumRateQuery(BaseModel):
    product_id: int
    age: int
    gender: Gender
    policy_term: int
    premium_paying_term: int
    sum_assured: float

class PremiumRate(BaseModel):
    id: int
    product_id: int
    age: int
    gender: str
    policy_term: int
    premium_paying_term: int
    sum_assured: float
    premium_rate: float
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportCreate(BaseModel):
    customer_id: int
    report_type: str
    content: Dict[str, Any]

class Report(BaseModel):
    id: int
    customer_id: int
    report_type: str
    content: Dict[str, Any]
    pdf_url: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True

# Market Data Schemas
class MarketData(BaseModel):
    id: int
    date: date
    inflation_rate: float
    repo_rate: float
    gdp_growth: float
    market_cap: float
    created_at: datetime

    class Config:
        from_attributes = True

# API Response Schemas
class InsuranceNeedsResponse(BaseModel):
    customer: Customer
    needs_analysis: NeedsAnalysis
    recommendations: List[Recommendation]
    calculator_results: CalculatorResult

class ProductComparisonResponse(BaseModel):
    products: List[Product]
    comparison_data: Dict[str, Any]

class ReportResponse(BaseModel):
    report: Report
    download_url: str

# Product Comparison Schemas
class ProductComparisonRequest(BaseModel):
    product_ids: List[int]
    customer_profile: dict
    sum_assured: float
    policy_term: int = 20
    premium_frequency: str = "yearly"

class ProductComparisonResult(BaseModel):
    product_id: int
    product_name: str
    insurer_name: str
    product_type: str
    premium_amount: float
    premium_rate_per_1000: float
    features: List[str]
    benefits: List[str]
    exclusions: List[str]
    rating: float
    claim_settlement_ratio: float
    recommendation_score: float

class ProductComparisonResponse(BaseModel):
    comparison_data: List[ProductComparisonResult]
    summary: dict
    recommendations: List[str]
    generated_at: datetime

class ReportResponse(BaseModel):
    report: Report
    download_url: str 