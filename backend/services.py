from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from models import NeedsAnalysis as NeedsAnalysisModel, Customer as CustomerModel, Product as ProductModel, Recommendation as RecommendationModel
from schemas import *
from typing import List, Dict, Any, Optional
import math
from datetime import date, datetime

class InsuranceCalculatorService:
    """Service for insurance calculations and needs analysis"""
    
    @staticmethod
    def calculate_human_life_value(annual_income: float, age: int, retirement_age: int = 60, 
                                 inflation_rate: float = 6.0, return_rate: float = 8.0) -> float:
        """Calculate Human Life Value (HLV) using Indian market parameters"""
        years_to_retirement = retirement_age - age
        if years_to_retirement <= 0:
            return 0
        
        # Calculate present value of future earnings
        hlv = 0
        for year in range(1, years_to_retirement + 1):
            # Future income with inflation
            future_income = annual_income * ((1 + inflation_rate/100) ** year)
            # Present value of future income
            present_value = future_income / ((1 + return_rate/100) ** year)
            hlv += present_value
        
        return round(hlv, 2)
    
    @staticmethod
    def calculate_insurance_needs(annual_income: float, family_size: int, dependents: int,
                                debt_obligations: float, children_education_needs: float,
                                retirement_needs: float, emergency_fund_needs: float,
                                existing_coverage: float = 0) -> Dict[str, float]:
        """Calculate comprehensive insurance needs for Indian families"""
        
        # Income replacement needs (10-15 times annual income)
        income_replacement = annual_income * 12  # 12 months buffer
        
        # Family expenses for dependents
        family_expenses = annual_income * 0.7 * dependents * 10  # 10 years of support
        
        # Total insurance needs
        total_needs = (income_replacement + family_expenses + debt_obligations + 
                      children_education_needs + retirement_needs + emergency_fund_needs)
        
        # Additional coverage needed
        additional_coverage = max(0, total_needs - existing_coverage)
        
        return {
            "income_replacement_needs": round(income_replacement, 2),
            "family_expenses": round(family_expenses, 2),
            "total_insurance_needs": round(total_needs, 2),
            "additional_coverage_needed": round(additional_coverage, 2)
        }
    
    @staticmethod
    def calculate_premium_estimate(age: int, gender: str, sum_assured: float, 
                                 policy_term: int, product_type: str) -> float:
        """Calculate premium estimate based on age, gender, and coverage"""
        
        # Base premium rates (per 1000 sum assured) - simplified for demo
        base_rates = {
            "term_life": {"male": 1.2, "female": 0.9},
            "endowment": {"male": 45.0, "female": 42.0},
            "ulip": {"male": 12.0, "female": 11.0}
        }
        
        # Age factor (premium increases with age)
        age_factor = 1 + (age - 25) * 0.05 if age > 25 else 1
        
        # Term factor (longer term = higher premium)
        term_factor = 1 + (policy_term - 10) * 0.02 if policy_term > 10 else 1
        
        # Get base rate
        base_rate = base_rates.get(product_type, {"male": 1.0, "female": 0.8})[gender.lower()]
        
        # Calculate premium
        premium_per_1000 = base_rate * age_factor * term_factor
        total_premium = (sum_assured / 1000) * premium_per_1000
        
        return round(total_premium, 2)
    
    @staticmethod
    def calculate_inflation_adjusted_returns(principal: float, return_rate: float, 
                                           inflation_rate: float, years: int) -> Dict[str, float]:
        """Calculate inflation-adjusted returns for ULIPs and savings products"""
        
        # Nominal returns
        nominal_value = principal * ((1 + return_rate/100) ** years)
        
        # Inflation-adjusted returns
        real_return_rate = ((1 + return_rate/100) / (1 + inflation_rate/100)) - 1
        real_value = principal * ((1 + real_return_rate) ** years)
        
        # Tax-adjusted returns (assuming 10% tax on gains)
        tax_rate = 0.10
        taxable_gains = nominal_value - principal
        tax_amount = taxable_gains * tax_rate
        after_tax_value = nominal_value - tax_amount
        
        return {
            "nominal_value": round(nominal_value, 2),
            "inflation_adjusted_value": round(real_value, 2),
            "after_tax_value": round(after_tax_value, 2),
            "real_return_rate": round(real_return_rate * 100, 2),
            "inflation_impact": round(nominal_value - real_value, 2)
        }
    
    @staticmethod
    def calculate_sip_returns(monthly_contribution: float, return_rate: float, 
                            inflation_rate: float, years: int) -> Dict[str, float]:
        """Calculate SIP (Systematic Investment Plan) returns with inflation adjustment"""
        
        # Calculate SIP returns using compound interest formula
        monthly_rate = return_rate / 12 / 100
        total_months = years * 12
        
        # SIP formula: FV = P * ((1 + r)^n - 1) / r
        # where P = monthly contribution, r = monthly rate, n = total months
        nominal_value = monthly_contribution * ((1 + monthly_rate) ** total_months - 1) / monthly_rate
        
        # Total investment
        total_investment = monthly_contribution * total_months
        
        # Real return rate
        real_return_rate = ((1 + return_rate/100) / (1 + inflation_rate/100)) - 1
        
        # Inflation-adjusted value
        inflation_adjusted_value = total_investment * ((1 + real_return_rate) ** years)
        
        return {
            "total_investment": round(total_investment, 2),
            "nominal_value": round(nominal_value, 2),
            "inflation_adjusted_value": round(inflation_adjusted_value, 2),
            "real_return_rate": round(real_return_rate * 100, 2),
            "inflation_impact": round(nominal_value - inflation_adjusted_value, 2)
        }
    
    @staticmethod
    def calculate_step_up_sip_returns(initial_monthly_contribution: float, return_rate: float,
                                    inflation_rate: float, years: int, step_up_rate: float = 10.0) -> Dict[str, float]:
        """Calculate Step-up SIP returns (increasing contribution annually)"""
        
        total_investment = 0
        nominal_value = 0
        monthly_rate = return_rate / 12 / 100
        
        for year in range(years):
            # Calculate contribution for this year (increases by step_up_rate% annually)
            yearly_contribution = initial_monthly_contribution * 12 * ((1 + step_up_rate/100) ** year)
            total_investment += yearly_contribution
            
            # Calculate returns for this year's contribution
            months_remaining = (years - year) * 12
            year_nominal_value = yearly_contribution * ((1 + monthly_rate) ** months_remaining - 1) / monthly_rate
            nominal_value += year_nominal_value
        
        # Real return rate
        real_return_rate = ((1 + return_rate/100) / (1 + inflation_rate/100)) - 1
        
        # Inflation-adjusted value
        inflation_adjusted_value = total_investment * ((1 + real_return_rate) ** years)
        
        return {
            "total_investment": round(total_investment, 2),
            "nominal_value": round(nominal_value, 2),
            "inflation_adjusted_value": round(inflation_adjusted_value, 2),
            "real_return_rate": round(real_return_rate * 100, 2),
            "inflation_impact": round(nominal_value - inflation_adjusted_value, 2)
        }
    
    @staticmethod
    def calculate_yearly_breakdown(initial_investment: float, monthly_contribution: float,
                                 return_rate: float, inflation_rate: float, years: int) -> List[Dict[str, float]]:
        """Calculate year-wise breakdown of investment growth"""
        
        breakdown = []
        current_value = initial_investment
        
        for year in range(1, years + 1):
            # Add monthly contributions for this year
            yearly_contribution = monthly_contribution * 12
            current_value += yearly_contribution
            
            # Apply returns
            current_value = current_value * (1 + return_rate/100)
            
            # Calculate inflation-adjusted value
            inflation_adjusted_value = current_value / ((1 + inflation_rate/100) ** year)
            
            breakdown.append({
                "year": year,
                "investment": round(initial_investment + (yearly_contribution * year), 2),
                "nominal_value": round(current_value, 2),
                "inflation_adjusted_value": round(inflation_adjusted_value, 2),
                "real_growth": round(inflation_adjusted_value - (initial_investment + yearly_contribution * year), 2)
            })
        
        return breakdown

class NeedsAnalysisService:
    """Service for comprehensive needs analysis"""
    
    @staticmethod
    async def create_needs_analysis(db: AsyncSession, customer_id: int, 
                                  calculator_input: CalculatorInput):
        """Create comprehensive needs analysis for customer"""
        
        # Check if a needs analysis already exists for this customer
        existing_query = select(NeedsAnalysisModel).where(NeedsAnalysisModel.customer_id == customer_id)
        existing_result = await db.execute(existing_query)
        existing_needs_analysis = existing_result.scalar_one_or_none()
        if existing_needs_analysis:
            return existing_needs_analysis

        # Calculate human life value
        hlv = InsuranceCalculatorService.calculate_human_life_value(
            calculator_input.annual_income,
            calculator_input.age,
            inflation_rate=calculator_input.inflation_rate,
            return_rate=calculator_input.return_rate
        )
        
        # Calculate insurance needs
        needs = InsuranceCalculatorService.calculate_insurance_needs(
            calculator_input.annual_income,
            calculator_input.family_size,
            calculator_input.dependents,
            calculator_input.debt_obligations,
            calculator_input.children_education_needs,
            calculator_input.retirement_needs,
            calculator_input.existing_coverage
        )
        
        # Create needs analysis record
        needs_analysis = NeedsAnalysisModel(
            customer_id=customer_id,
            human_life_value=hlv,
            income_replacement_needs=needs["income_replacement_needs"],
            debt_obligations=calculator_input.debt_obligations,
            children_education_needs=calculator_input.children_education_needs,
            retirement_needs=calculator_input.retirement_needs,
            emergency_fund_needs=calculator_input.existing_coverage * 0.1,  # 10% of existing coverage
            total_insurance_needs=needs["total_insurance_needs"],
            existing_coverage=calculator_input.existing_coverage,
            additional_coverage_needed=needs["additional_coverage_needed"]
        )
        
        db.add(needs_analysis)
        await db.commit()
        await db.refresh(needs_analysis)
        
        return needs_analysis

class RecommendationService:
    """Service for generating insurance recommendations"""
    
    @staticmethod
    async def generate_recommendations(db: AsyncSession, customer_id: int, 
                                    needs_analysis: NeedsAnalysisModel) -> List[RecommendationModel]:
        """Generate personalized insurance recommendations"""
        
        # Check if recommendations already exist for this customer
        existing_rec_query = select(RecommendationModel).where(RecommendationModel.customer_id == customer_id)
        existing_rec_result = await db.execute(existing_rec_query)
        existing_recommendations = existing_rec_result.scalars().all()
        
        if existing_recommendations:
            print(f"Found {len(existing_recommendations)} existing recommendations for customer {customer_id}")
            return existing_recommendations
        
        # Get customer details
        customer_query = select(CustomerModel).where(CustomerModel.id == customer_id)
        customer_result = await db.execute(customer_query)
        customer = customer_result.scalar_one()
        
        # Get suitable products based on customer profile with insurer data eagerly loaded
        products_query = select(ProductModel).options(joinedload(ProductModel.insurer)).where(
            and_(
                ProductModel.is_active == True,
                ProductModel.min_age <= customer.age,
                ProductModel.max_age >= customer.age
            )
        )
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()

        # Fetch existing recommendations for this customer and product
        existing_recs_query = select(RecommendationModel).where(RecommendationModel.customer_id == customer_id)
        existing_recs_result = await db.execute(existing_recs_query)
        existing_recs = existing_recs_result.scalars().all()
        existing_product_ids = {rec.product_id for rec in existing_recs}

        recommendations = []

        for product in products:
            if product.id in existing_product_ids:
                continue  # Skip if recommendation already exists for this product
            # Calculate recommended sum assured
            if needs_analysis.additional_coverage_needed > 0:
                sum_assured = min(
                    needs_analysis.additional_coverage_needed,
                    product.max_sum_assured
                )
            else:
                sum_assured = product.min_sum_assured
            
            # Calculate premium
            premium = InsuranceCalculatorService.calculate_premium_estimate(
                customer.age,
                customer.gender,
                sum_assured,
                20,  # Default policy term
                product.product_type
            )
            
            # Determine priority based on product type and customer needs
            priority = "high" if product.product_type == "term_life" else "medium"
            
            # Generate reasoning
            reasoning = f"Recommended {product.name} from {product.insurer.name} based on your age ({customer.age}), income (₹{customer.annual_income:,.0f}), and family size ({customer.family_size}). This provides ₹{sum_assured:,.0f} coverage at ₹{premium:,.0f} annual premium."
            
            recommendation = RecommendationModel(
                customer_id=customer_id,
                product_id=product.id,
                sum_assured=sum_assured,
                premium_amount=premium,
                policy_term=20,
                premium_paying_term=20,
                premium_frequency="yearly",
                reasoning=reasoning,
                priority=priority
            )
            
            db.add(recommendation)
            recommendations.append(recommendation)
        
        await db.commit()
        
        # Refresh recommendations to get IDs
        for rec in recommendations:
            await db.refresh(rec)
        
        print(f"Created {len(recommendations)} new recommendations for customer {customer_id}")
        return existing_recs + recommendations

class ProductComparisonService:
    """Service for product comparison and analysis"""
    
    @staticmethod
    async def compare_products(db: AsyncSession, product_ids: List[int], 
                             customer_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Compare multiple insurance products"""
        
        products_query = select(ProductModel).where(ProductModel.id.in_(product_ids))
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()
        
        comparison_data = {
            "products": [],
            "premium_comparison": {},
            "feature_comparison": {},
            "recommendations": []
        }
        
        for product in products:
            # Calculate premium for customer profile
            premium = InsuranceCalculatorService.calculate_premium_estimate(
                customer_profile["age"],
                customer_profile["gender"],
                customer_profile["sum_assured"],
                customer_profile["policy_term"],
                product.product_type
            )
            
            product_data = {
                "id": product.id,
                "name": product.name,
                "insurer": product.insurer.name,
                "product_type": product.product_type,
                "premium": premium,
                "features": product.features,
                "benefits": product.benefits,
                "rating": product.insurer.rating
            }
            
            comparison_data["products"].append(product_data)
            comparison_data["premium_comparison"][product.name] = premium
        
        # Sort by premium (lowest first)
        comparison_data["products"].sort(key=lambda x: x["premium"])
        
        return comparison_data

class ReportGenerationService:
    """Service for generating PDF reports"""
    
    @staticmethod
    async def generate_needs_analysis_report(db: AsyncSession, customer_id: int) -> Dict[str, Any]:
        """Generate comprehensive needs analysis report"""
        
        # Get customer and related data
        customer_query = select(CustomerModel).where(CustomerModel.id == customer_id)
        customer_result = await db.execute(customer_query)
        customer = customer_result.scalar_one()
        
        needs_query = select(NeedsAnalysisModel).where(NeedsAnalysisModel.customer_id == customer_id)
        needs_result = await db.execute(needs_query)
        needs_analysis = needs_result.scalar_one()
        
        recommendations_query = select(RecommendationModel).where(RecommendationModel.customer_id == customer_id)
        recommendations_result = await db.execute(recommendations_query)
        recommendations = recommendations_result.scalars().all()
        
        # Generate report content
        report_content = {
            "customer_info": {
                "name": customer.name,
                "age": customer.age,
                "occupation": customer.occupation,
                "annual_income": customer.annual_income,
                "family_size": customer.family_size
            },
            "needs_analysis": {
                "human_life_value": needs_analysis.human_life_value,
                "total_insurance_needs": needs_analysis.total_insurance_needs,
                "existing_coverage": needs_analysis.existing_coverage,
                "additional_coverage_needed": needs_analysis.additional_coverage_needed
            },
            "recommendations": [
                {
                    "product_name": rec.product.name,
                    "insurer": rec.product.insurer.name,
                    "sum_assured": rec.sum_assured,
                    "premium": rec.premium_amount,
                    "reasoning": rec.reasoning,
                    "priority": rec.priority
                }
                for rec in recommendations
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        return report_content 