from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime
from sqlalchemy.orm import joinedload

from database import get_db
from models import *
from schemas import *
from services import *

app = FastAPI(
    title="Life Insurance Advisor API",
    description="Comprehensive Life Insurance Advisor for Indian Market",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Life Insurance Advisor API is running!",
        "version": "1.0.0",
        "features": [
            "Insurance Needs Analysis",
            "Product Comparison",
            "Premium Calculator",
            "Recommendation Engine",
            "PDF Report Generation",
            "Indian Market Focus"
        ]
    }

# Insurer endpoints
@app.get("/insurers/", response_model=List[Insurer])
async def get_insurers(db: AsyncSession = Depends(get_db)):
    """Get all insurance companies"""
    from models import Insurer as InsurerModel
    query = select(InsurerModel).order_by(InsurerModel.name)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/insurers/{insurer_id}", response_model=Insurer)
async def get_insurer(insurer_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific insurance company details"""
    from models import Insurer as InsurerModel
    query = select(InsurerModel).where(InsurerModel.id == insurer_id)
    result = await db.execute(query)
    insurer = result.scalar_one_or_none()
    
    if not insurer:
        raise HTTPException(status_code=404, detail="Insurer not found")
    
    return insurer

# Product endpoints
@app.get("/products/", response_model=List[Product])
async def get_products(
    product_type: Optional[str] = None,
    insurer_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all products with optional filtering"""
    from models import Product as ProductModel
    from sqlalchemy.orm import selectinload
    
    query = select(ProductModel).options(selectinload(ProductModel.insurer)).where(ProductModel.is_active == True)
    
    if product_type:
        query = query.where(ProductModel.product_type == product_type)
    if insurer_id:
        query = query.where(ProductModel.insurer_id == insurer_id)
    
    query = query.order_by(ProductModel.name)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific product details"""
    from models import Product as ProductModel
    from sqlalchemy.orm import selectinload
    
    query = select(ProductModel).options(selectinload(ProductModel.insurer)).where(ProductModel.id == product_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

# Customer endpoints
@app.post("/customers/", response_model=Customer)
async def create_customer(customer: CustomerCreate, db: AsyncSession = Depends(get_db)):
    """Create a new customer"""
    try:
        # Create customer data from Pydantic model
        customer_data = customer.dict()
        # Create SQLAlchemy model instance
        from models import Customer as CustomerModel
        db_customer = CustomerModel(**customer_data)
        db.add(db_customer)
        await db.commit()
        await db.refresh(db_customer)
        return db_customer
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/customers/", response_model=List[Customer])
async def get_customers(db: AsyncSession = Depends(get_db)):
    """Get all customers"""
    from models import Customer as CustomerModel
    query = select(CustomerModel).order_by(CustomerModel.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Get customer details"""
    from models import Customer as CustomerModel
    query = select(CustomerModel).where(CustomerModel.id == customer_id)
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return customer

@app.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: int, 
    customer_update: CustomerUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update customer information"""
    from models import Customer as CustomerModel
    query = select(CustomerModel).where(CustomerModel.id == customer_id)
    result = await db.execute(query)
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update only provided fields
    update_data = customer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    return customer

# Calculator endpoints
@app.post("/calculator/needs-analysis/", response_model=CalculatorResult)
async def calculate_insurance_needs(
    calculator_input: CalculatorInput,
    db: AsyncSession = Depends(get_db)
):
    """Calculate comprehensive insurance needs"""
    
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
    
    # Calculate premium estimates for different product types
    premium_estimates = {}
    for product_type in ["term_life", "endowment", "ulip"]:
        premium = InsuranceCalculatorService.calculate_premium_estimate(
            calculator_input.age,
            calculator_input.gender,
            needs["additional_coverage_needed"],
            20,  # 20-year term
            product_type
        )
        premium_estimates[product_type] = premium
    
    # Calculate inflation-adjusted returns
    inflation_adjusted_returns = InsuranceCalculatorService.calculate_inflation_adjusted_returns(
        calculator_input.annual_income * 0.1,  # 10% of income as investment
        calculator_input.return_rate,
        calculator_input.inflation_rate,
        20  # 20 years
    )
    
    return CalculatorResult(
        human_life_value=hlv,
        recommended_coverage=needs["total_insurance_needs"],
        additional_coverage_needed=needs["additional_coverage_needed"],
        premium_estimates=premium_estimates,
        inflation_adjusted_returns=inflation_adjusted_returns
    )

@app.post("/calculator/premium/")
async def calculate_premium(
    premium_query: PremiumRateQuery,
    db: AsyncSession = Depends(get_db)
):
    """Calculate premium for specific product and parameters"""
    
    # Get product details
    product_query = select(Product).where(Product.id == premium_query.product_id)
    result = await db.execute(product_query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate premium
    premium = InsuranceCalculatorService.calculate_premium_estimate(
        premium_query.age,
        premium_query.gender,
        premium_query.sum_assured,
        premium_query.policy_term,
        product.product_type
    )
    
    return {
        "product_name": product.name,
        "insurer": product.insurer.name,
        "sum_assured": premium_query.sum_assured,
        "premium_amount": premium,
        "premium_rate_per_1000": round((premium / premium_query.sum_assured) * 1000, 2)
    }

@app.post("/calculator/inflation-adjusted-returns/")
async def calculate_inflation_adjusted_returns(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Calculate inflation-adjusted returns for different investment scenarios"""
    
    # Extract parameters
    initial_investment = request.get("initial_investment", 100000)
    monthly_contribution = request.get("monthly_contribution", 10000)
    investment_period_years = request.get("investment_period_years", 20)
    expected_return_rate = request.get("expected_return_rate", 8.0)
    inflation_rate = request.get("inflation_rate", 6.0)
    investment_frequency = request.get("investment_frequency", "monthly")  # monthly, quarterly, yearly
    
    # Calculate returns for different scenarios
    scenarios = {}
    
    # Scenario 1: Fixed returns
    fixed_returns = InsuranceCalculatorService.calculate_inflation_adjusted_returns(
        initial_investment,
        expected_return_rate,
        inflation_rate,
        investment_period_years
    )
    scenarios["fixed_returns"] = {
        "nominal_value": fixed_returns["nominal_value"],
        "inflation_adjusted_value": fixed_returns["inflation_adjusted_value"],
        "real_return_rate": fixed_returns["real_return_rate"],
        "inflation_impact": fixed_returns["inflation_impact"]
    }
    
    # Scenario 2: SIP (Systematic Investment Plan)
    sip_returns = InsuranceCalculatorService.calculate_sip_returns(
        monthly_contribution,
        expected_return_rate,
        inflation_rate,
        investment_period_years
    )
    scenarios["sip_returns"] = {
        "total_investment": sip_returns["total_investment"],
        "nominal_value": sip_returns["nominal_value"],
        "inflation_adjusted_value": sip_returns["inflation_adjusted_value"],
        "real_return_rate": sip_returns["real_return_rate"],
        "inflation_impact": sip_returns["inflation_impact"]
    }
    
    # Scenario 3: Step-up SIP (increasing contribution by 10% annually)
    step_up_sip = InsuranceCalculatorService.calculate_step_up_sip_returns(
        monthly_contribution,
        expected_return_rate,
        inflation_rate,
        investment_period_years,
        step_up_rate=10.0
    )
    scenarios["step_up_sip"] = {
        "total_investment": step_up_sip["total_investment"],
        "nominal_value": step_up_sip["nominal_value"],
        "inflation_adjusted_value": step_up_sip["inflation_adjusted_value"],
        "real_return_rate": step_up_sip["real_return_rate"],
        "inflation_impact": step_up_sip["inflation_impact"]
    }
    
    # Calculate year-wise breakdown
    yearly_breakdown = InsuranceCalculatorService.calculate_yearly_breakdown(
        initial_investment,
        monthly_contribution,
        expected_return_rate,
        inflation_rate,
        investment_period_years
    )
    
    return {
        "scenarios": scenarios,
        "yearly_breakdown": yearly_breakdown,
        "parameters": {
            "initial_investment": initial_investment,
            "monthly_contribution": monthly_contribution,
            "investment_period_years": investment_period_years,
            "expected_return_rate": expected_return_rate,
            "inflation_rate": inflation_rate,
            "investment_frequency": investment_frequency
        },
        "insights": {
            "inflation_impact_message": f"With {inflation_rate}% inflation, your purchasing power decreases significantly over {investment_period_years} years",
            "recommendation": "Consider step-up SIP to combat inflation and increase wealth creation",
            "tax_implications": "Long-term capital gains on equity investments are taxed at 10% above ₹1 lakh"
        }
    }

# Needs Analysis endpoints
@app.post("/needs-analysis/", response_model=NeedsAnalysis)
async def create_needs_analysis(
    calculator_input: CalculatorInput,
    db: AsyncSession = Depends(get_db)
):
    """Create comprehensive needs analysis"""
    try:
        result = await NeedsAnalysisService.create_needs_analysis(db, calculator_input.customer_id, calculator_input)
        print(f"DEBUG: type(result) = {type(result)}")
        return NeedsAnalysis.from_orm(result)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        # If the error is due to unique constraint, fetch and return the existing record
        if 'unique constraint' in str(e).lower() or 'duplicate key' in str(e).lower():
            from models import NeedsAnalysis as NeedsAnalysisModel
            query = select(NeedsAnalysisModel).where(NeedsAnalysisModel.customer_id == calculator_input.customer_id)
            result = await db.execute(query)
            needs_analysis = result.scalar_one_or_none()
            if needs_analysis:
                return NeedsAnalysis.from_orm(needs_analysis)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/needs-analysis/{customer_id}", response_model=NeedsAnalysis)
async def get_needs_analysis(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Get customer's needs analysis"""
    from models import NeedsAnalysis as NeedsAnalysisModel
    query = select(NeedsAnalysisModel).where(NeedsAnalysisModel.customer_id == customer_id)
    result = await db.execute(query)
    needs_analysis = result.scalar_one_or_none()
    
    if not needs_analysis:
        raise HTTPException(status_code=404, detail="Needs analysis not found")
    
    return needs_analysis

# Recommendation endpoints
@app.post("/recommendations/generate/", response_model=List[Recommendation])
async def generate_recommendations(
    customer_id: int = Query(..., description="Customer ID to generate recommendations for"),
    db: AsyncSession = Depends(get_db)
):
    """Generate personalized recommendations for customer"""
    
    # Get needs analysis - get the most recent one if multiple exist
    from models import NeedsAnalysis as NeedsAnalysisModel, Recommendation as RecommendationModel, Product as ProductModel
    needs_query = select(NeedsAnalysisModel).where(NeedsAnalysisModel.customer_id == customer_id).order_by(NeedsAnalysisModel.analysis_date.desc())
    needs_result = await db.execute(needs_query)
    needs_analysis = needs_result.scalars().first()
    
    if not needs_analysis:
        raise HTTPException(status_code=404, detail="No needs analysis found for this customer")
    
    # Generate recommendations
    recommendations = await RecommendationService.generate_recommendations(db, customer_id, needs_analysis)
    
    # Convert SQLAlchemy models to Pydantic schemas
    recommendation_schemas = []
    for rec in recommendations:
        # Create Pydantic schema from SQLAlchemy model - simplified to avoid lazy loading issues
        rec_schema = Recommendation(
            id=rec.id,
            customer_id=rec.customer_id,
            product_id=rec.product_id,
            reasoning=rec.reasoning,
            sum_assured=rec.sum_assured,
            premium_amount=rec.premium_amount,
            policy_term=rec.policy_term,
            premium_paying_term=rec.premium_paying_term,
            premium_frequency=rec.premium_frequency,
            priority=rec.priority,
            created_at=rec.created_at
        )
        recommendation_schemas.append(rec_schema)
    
    return recommendation_schemas

@app.get("/recommendations/{customer_id}", response_model=List[Recommendation])
async def get_recommendations(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Get customer's recommendations"""
    from models import Recommendation as RecommendationModel
    query = select(RecommendationModel).where(RecommendationModel.customer_id == customer_id)
    result = await db.execute(query)
    return result.scalars().all()

# Product Comparison endpoints
@app.post("/products/compare/", response_model=ProductComparisonResponse)
async def compare_products(
    comparison_request: ProductComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    """Compare multiple insurance products with detailed analysis"""
    try:
        # Get products with insurer data
        from models import Product as ProductModel
        from sqlalchemy.orm import selectinload
        
        products_query = select(ProductModel).options(selectinload(ProductModel.insurer)).where(
            ProductModel.id.in_(comparison_request.product_ids)
        )
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()
        
        if not products:
            raise HTTPException(status_code=404, detail="No products found")
        
        comparison_data = []
        total_premium = 0
        min_premium = float('inf')
        max_premium = 0
        
        for product in products:
            # Calculate premium for the customer profile
            premium = InsuranceCalculatorService.calculate_premium_estimate(
                comparison_request.customer_profile.get("age", 30),
                comparison_request.customer_profile.get("gender", "male"),
                comparison_request.sum_assured,
                comparison_request.policy_term,
                product.product_type
            )
            
            premium_rate_per_1000 = (premium / comparison_request.sum_assured) * 1000
            
            # Calculate recommendation score based on multiple factors
            recommendation_score = calculate_recommendation_score(
                product, premium, comparison_request.customer_profile
            )
            
            comparison_result = ProductComparisonResult(
                product_id=product.id,
                product_name=product.name,
                insurer_name=product.insurer.name,
                product_type=product.product_type,
                premium_amount=premium,
                premium_rate_per_1000=premium_rate_per_1000,
                features=product.features or [],
                benefits=product.benefits or [],
                exclusions=product.exclusions or [],
                rating=product.insurer.rating,
                claim_settlement_ratio=product.insurer.claim_settlement_ratio,
                recommendation_score=recommendation_score
            )
            
            comparison_data.append(comparison_result)
            total_premium += premium
            min_premium = min(min_premium, premium)
            max_premium = max(max_premium, premium)
        
        # Sort by recommendation score (highest first)
        comparison_data.sort(key=lambda x: x.recommendation_score, reverse=True)
        
        # Generate summary
        summary = {
            "total_products": len(comparison_data),
            "total_premium": total_premium,
            "average_premium": total_premium / len(comparison_data),
            "min_premium": min_premium,
            "max_premium": max_premium,
            "premium_range": max_premium - min_premium,
            "best_value_product": comparison_data[0].product_name if comparison_data else None,
            "lowest_premium_product": min(comparison_data, key=lambda x: x.premium_amount).product_name if comparison_data else None
        }
        
        # Generate recommendations
        recommendations = generate_comparison_recommendations(comparison_data, comparison_request.customer_profile)
        
        return ProductComparisonResponse(
            comparison_data=comparison_data,
            summary=summary,
            recommendations=recommendations,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

def calculate_recommendation_score(product, premium, customer_profile):
    """Calculate a recommendation score for a product based on multiple factors"""
    score = 0.0
    
    # Base score from insurer rating (0-10)
    score += product.insurer.rating * 2
    
    # Claim settlement ratio bonus (0-5 points)
    score += (product.insurer.claim_settlement_ratio / 100) * 5
    
    # Premium affordability (lower premium = higher score, 0-3 points)
    customer_age = customer_profile.get("age", 30)
    customer_income = customer_profile.get("annual_income", 1000000)
    premium_to_income_ratio = premium / customer_income
    
    if premium_to_income_ratio < 0.05:  # Less than 5% of income
        score += 3
    elif premium_to_income_ratio < 0.1:  # Less than 10% of income
        score += 2
    elif premium_to_income_ratio < 0.15:  # Less than 15% of income
        score += 1
    
    # Product type preference based on age and risk appetite
    risk_appetite = customer_profile.get("risk_appetite", "medium")
    
    if customer_age < 35:
        if product.product_type == "ulip" and risk_appetite in ["high", "medium"]:
            score += 2
        elif product.product_type == "term_life" and risk_appetite == "low":
            score += 2
    elif customer_age < 50:
        if product.product_type == "endowment":
            score += 1.5
        elif product.product_type == "term_life":
            score += 1
    
    return round(score, 2)

def generate_comparison_recommendations(comparison_data, customer_profile):
    """Generate recommendations based on comparison results"""
    recommendations = []
    
    if not comparison_data:
        return recommendations
    
    # Best overall recommendation
    best_product = comparison_data[0]
    recommendations.append(f"🏆 **{best_product.product_name}** from {best_product.insurer_name} is our top recommendation with a score of {best_product.recommendation_score}/20")
    
    # Lowest premium recommendation
    lowest_premium = min(comparison_data, key=lambda x: x.premium_amount)
    if lowest_premium.product_id != best_product.product_id:
        recommendations.append(f"💰 **{lowest_premium.product_name}** offers the lowest premium at ₹{lowest_premium.premium_amount:,.0f} annually")
    
    # Best claim settlement ratio
    best_claim_ratio = max(comparison_data, key=lambda x: x.claim_settlement_ratio)
    if best_claim_ratio.claim_settlement_ratio > 95:
        recommendations.append(f"✅ **{best_claim_ratio.product_name}** has the highest claim settlement ratio at {best_claim_ratio.claim_settlement_ratio}%")
    
    # Premium range analysis
    premium_range = max(x.premium_amount for x in comparison_data) - min(x.premium_amount for x in comparison_data)
    if premium_range > 50000:
        recommendations.append(f"📊 Premium difference between products is ₹{premium_range:,.0f} - consider your budget carefully")
    
    # Age-specific recommendations
    customer_age = customer_profile.get("age", 30)
    if customer_age < 35:
        recommendations.append("🎯 For your age, consider ULIP products for potential higher returns")
    elif customer_age > 50:
        recommendations.append("🎯 For your age, term life or endowment policies may be more suitable")
    
    return recommendations

# Report endpoints
@app.post("/reports/generate/", response_model=Report)
async def generate_report(
    report_create: ReportCreate,
    db: AsyncSession = Depends(get_db)
):
    """Generate PDF report"""
    
    # Generate report content based on type
    if report_create.report_type == "needs_analysis":
        content = await ReportGenerationService.generate_needs_analysis_report(
            db, report_create.customer_id
        )
    else:
        content = {"message": "Report type not implemented yet"}
    
    # Create report record
    report = Report(
        customer_id=report_create.customer_id,
        report_type=report_create.report_type,
        content=content
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    return report

@app.get("/reports/{customer_id}", response_model=List[Report])
async def get_customer_reports(customer_id: int, db: AsyncSession = Depends(get_db)):
    """Get all reports for a customer"""
    from models import Report as ReportModel
    query = select(ReportModel).where(ReportModel.customer_id == customer_id)
    result = await db.execute(query)
    return result.scalars().all()

# PDF Generation endpoints
@app.get("/pdf/needs-analysis/{customer_id}")
async def generate_needs_analysis_pdf(
    customer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Generate PDF report for needs analysis"""
    from fastapi.responses import StreamingResponse
    from pdf_service import PDFReportService
    
    # Get customer details
    from models import Customer as CustomerModel
    customer_query = select(CustomerModel).where(CustomerModel.id == customer_id)
    customer_result = await db.execute(customer_query)
    customer = customer_result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get needs analysis
    from models import NeedsAnalysis as NeedsAnalysisModel
    needs_query = select(NeedsAnalysisModel).where(
        NeedsAnalysisModel.customer_id == customer_id
    ).order_by(NeedsAnalysisModel.analysis_date.desc())
    needs_result = await db.execute(needs_query)
    needs_analysis = needs_result.scalar_one_or_none()
    
    if not needs_analysis:
        raise HTTPException(status_code=404, detail="Needs analysis not found")
    
    # Get recommendations
    from models import Recommendation as RecommendationModel
    rec_query = select(RecommendationModel).where(
        RecommendationModel.customer_id == customer_id
    ).order_by(RecommendationModel.priority.desc())
    rec_result = await db.execute(rec_query)
    recommendations = rec_result.scalars().all()
    
    # Prepare data for PDF
    pdf_data = {
        "customer_info": {
            "name": customer.name,
            "age": customer.age,
            "occupation": customer.occupation or "N/A",
            "annual_income": customer.annual_income,
            "family_size": customer.family_size
        },
        "needs_analysis": {
            "human_life_value": needs_analysis.human_life_value,
            "total_insurance_needs": needs_analysis.total_insurance_needs,
            "existing_coverage": needs_analysis.existing_coverage,
            "additional_coverage_needed": needs_analysis.additional_coverage_needed
        },
        "recommendations": []
    }
    
    # Add recommendations if available
    for rec in recommendations:
        pdf_data["recommendations"].append({
            "product_name": rec.product.name if rec.product else "N/A",
            "insurer": rec.product.insurer.name if rec.product and rec.product.insurer else "N/A",
            "sum_assured": rec.sum_assured,
            "premium": rec.premium_amount,
            "priority": rec.priority
        })
    
    # Generate PDF
    pdf_buffer = PDFReportService.create_needs_analysis_report(pdf_data)
    
    # Return PDF as streaming response
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=needs_analysis_{customer.name.replace(' ', '_')}.pdf"
        }
    )

@app.post("/pdf/product-comparison/")
async def generate_product_comparison_pdf(
    comparison_request: ProductComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate PDF report for product comparison"""
    from fastapi.responses import StreamingResponse
    from pdf_service import PDFReportService
    
    # Get products for comparison
    from models import Product as ProductModel, Insurer as InsurerModel
    products_query = select(ProductModel).where(
        ProductModel.id.in_(comparison_request.product_ids)
    )
    products_result = await db.execute(products_query)
    products = products_result.scalars().all()
    
    if not products:
        raise HTTPException(status_code=404, detail="Products not found")
    
    # Get insurers for the products
    insurer_ids = [p.insurer_id for p in products]
    insurers_query = select(InsurerModel).where(InsurerModel.id.in_(insurer_ids))
    insurers_result = await db.execute(insurers_query)
    insurers = {i.id: i for i in insurers_result.scalars().all()}
    
    # Prepare data for PDF
    pdf_data = {
        "products": []
    }
    
    for product in products:
        insurer = insurers.get(product.insurer_id)
        pdf_data["products"].append({
            "name": product.name,
            "insurer": insurer.name if insurer else "N/A",
            "product_type": product.product_type,
            "premium": product.min_premium,
            "rating": 4.5  # Default rating, can be enhanced
        })
    
    # Generate PDF
    pdf_buffer = PDFReportService.create_product_comparison_report(pdf_data)
    
    # Return PDF as streaming response
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=product_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
    )

@app.get("/pdf/comprehensive-report/{customer_id}")
async def generate_comprehensive_report_pdf(
    customer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Generate comprehensive PDF report including needs analysis, recommendations, and market insights"""
    from fastapi.responses import StreamingResponse
    from pdf_service import PDFReportService
    
    # Get customer details
    from models import Customer as CustomerModel
    customer_query = select(CustomerModel).where(CustomerModel.id == customer_id)
    customer_result = await db.execute(customer_query)
    customer = customer_result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get needs analysis
    from models import NeedsAnalysis as NeedsAnalysisModel
    needs_query = select(NeedsAnalysisModel).where(
        NeedsAnalysisModel.customer_id == customer_id
    ).order_by(NeedsAnalysisModel.analysis_date.desc())
    needs_result = await db.execute(needs_query)
    needs_analysis = needs_result.scalar_one_or_none()
    
    # Get recommendations
    from models import Recommendation as RecommendationModel
    rec_query = select(RecommendationModel).where(
        RecommendationModel.customer_id == customer_id
    ).order_by(RecommendationModel.priority.desc())
    rec_result = await db.execute(rec_query)
    recommendations = rec_result.scalars().all()
    
    # Prepare comprehensive data
    pdf_data = {
        "customer_info": {
            "name": customer.name,
            "age": customer.age,
            "occupation": customer.occupation or "N/A",
            "annual_income": customer.annual_income,
            "family_size": customer.family_size,
            "dependents": customer.dependents,
            "risk_appetite": customer.risk_appetite
        },
        "needs_analysis": {
            "human_life_value": needs_analysis.human_life_value if needs_analysis else 0,
            "total_insurance_needs": needs_analysis.total_insurance_needs if needs_analysis else 0,
            "existing_coverage": needs_analysis.existing_coverage if needs_analysis else 0,
            "additional_coverage_needed": needs_analysis.additional_coverage_needed if needs_analysis else 0
        },
        "recommendations": [],
        "market_insights": {
            "inflation_rate": "6%",
            "tax_benefits": "Section 80C - Up to ₹1.5 lakh tax deductible",
            "claim_settlement_tip": "Choose insurers with >95% claim settlement ratio"
        }
    }
    
    # Add recommendations if available
    for rec in recommendations:
        pdf_data["recommendations"].append({
            "product_name": rec.product.name if rec.product else "N/A",
            "insurer": rec.product.insurer.name if rec.product and rec.product.insurer else "N/A",
            "sum_assured": rec.sum_assured,
            "premium": rec.premium_amount,
            "priority": rec.priority
        })
    
    # Generate PDF
    pdf_buffer = PDFReportService.create_needs_analysis_report(pdf_data)
    
    # Return PDF as streaming response
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=comprehensive_report_{customer.name.replace(' ', '_')}.pdf"
        }
    )

# Market Data endpoints
@app.get("/market-data/", response_model=List[MarketData])
async def get_market_data(db: AsyncSession = Depends(get_db)):
    """Get market data for insurance products"""
    from models import MarketData as MarketDataModel
    query = select(MarketDataModel).order_by(MarketDataModel.date.desc())
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/market-data/latest/", response_model=List[MarketData])
async def get_latest_market_data(db: AsyncSession = Depends(get_db)):
    """Get latest market data for all insurers"""
    from models import MarketData as MarketDataModel
    from sqlalchemy import func
    
    # Get the latest data for each insurer
    subquery = select(
        MarketDataModel.insurer_id,
        func.max(MarketDataModel.date).label('max_date')
    ).group_by(MarketDataModel.insurer_id).subquery()
    
    query = select(MarketDataModel).join(
        subquery,
        and_(
            MarketDataModel.insurer_id == subquery.c.insurer_id,
            MarketDataModel.date == subquery.c.max_date
        )
    ).order_by(MarketDataModel.insurer_id)
    
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/market-data/insurer/{insurer_id}/", response_model=List[MarketData])
async def get_insurer_market_data(insurer_id: int, db: AsyncSession = Depends(get_db)):
    """Get market data for specific insurer"""
    from models import MarketData as MarketDataModel
    query = select(MarketDataModel).where(MarketDataModel.insurer_id == insurer_id).order_by(MarketDataModel.date.desc())
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/market-data/trends/", response_model=Dict[str, Any])
async def get_market_trends(db: AsyncSession = Depends(get_db)):
    """Get market trends and analysis"""
    from models import MarketData as MarketDataModel, Insurer as InsurerModel
    from sqlalchemy import func, and_
    
    # Get latest data for each insurer
    latest_data_query = select(
        MarketDataModel.insurer_id,
        func.max(MarketDataModel.date).label('max_date')
    ).group_by(MarketDataModel.insurer_id).subquery()
    
    latest_data = select(MarketDataModel).join(
        latest_data_query,
        and_(
            MarketDataModel.insurer_id == latest_data_query.c.insurer_id,
            MarketDataModel.date == latest_data_query.c.max_date
        )
    ).options(joinedload(MarketDataModel.insurer))
    
    result = await db.execute(latest_data)
    latest_market_data = result.scalars().all()
    
    # Calculate trends based on historical data
    historical_query = select(MarketDataModel).order_by(MarketDataModel.date.desc()).limit(20)
    historical_result = await db.execute(historical_query)
    historical_data = historical_result.scalars().all()
    
    # Calculate trend percentages (simplified calculation)
    inflation_trend = 0.5  # Mock trend data
    repo_rate_trend = -0.2
    gdp_growth_trend = 1.2
    market_cap_trend = 2.1
    
    # Top performers as strings
    top_performers = []
    if latest_market_data:
        top_claim_ratio = sorted(latest_market_data, key=lambda x: x.claim_settlement_ratio, reverse=True)[:5]
        top_performers = [data.insurer.name for data in top_claim_ratio]
    
    # Market insights
    market_insights = [
        "High claim settlement ratios indicate strong customer service across the industry",
        "Strong customer satisfaction across insurance providers",
        "Market consolidation trends favor larger insurers",
        "Digital transformation is driving product innovation"
    ]
    
    trends = {
        "inflation_trend": inflation_trend,
        "repo_rate_trend": repo_rate_trend,
        "gdp_growth_trend": gdp_growth_trend,
        "market_cap_trend": market_cap_trend,
        "top_performers": top_performers,
        "market_insights": market_insights
    }
    
    return trends

@app.get("/market-data/insights/", response_model=Dict[str, Any])
async def get_market_insights(db: AsyncSession = Depends(get_db)):
    """Get market insights and recommendations"""
    from models import MarketData as MarketDataModel, Insurer as InsurerModel
    from sqlalchemy import func, and_
    
    # Get historical data for trend analysis
    query = select(MarketDataModel).options(joinedload(MarketDataModel.insurer)).order_by(MarketDataModel.date.desc()).limit(100)
    result = await db.execute(query)
    historical_data = result.scalars().all()
    
    insights = {
        "key_insights": [],
        "recommendations": [],
        "risk_factors": []
    }
    
    if historical_data:
        # Analyze claim settlement trends
        claim_ratios = [data.claim_settlement_ratio for data in historical_data]
        avg_claim_ratio = sum(claim_ratios) / len(claim_ratios)
        
        if avg_claim_ratio > 95:
            insights["key_insights"].append("High claim settlement ratios indicate strong customer service across the industry")
        elif avg_claim_ratio < 85:
            insights["key_insights"].append("Lower claim settlement ratios suggest potential service quality issues")
        
        # Analyze ratings
        ratings = [data.rating for data in historical_data]
        avg_rating = sum(ratings) / len(ratings)
        
        if avg_rating > 4.0:
            insights["key_insights"].append("Strong customer satisfaction across insurance providers")
        elif avg_rating < 3.0:
            insights["key_insights"].append("Customer satisfaction needs improvement in the industry")
        
        # Add more key insights
        insights["key_insights"].extend([
            "Market consolidation trends favor larger insurers",
            "Digital transformation is driving product innovation",
            "Regulatory changes are improving transparency"
        ])
        
        # Generate recommendations
        insights["recommendations"] = [
            "Focus on insurers with claim settlement ratios above 95% for better service",
            "Consider customer ratings above 4.0 for enhanced satisfaction",
            "Monitor market share trends for competitive positioning",
            "Evaluate product offerings based on market performance data",
            "Diversify across multiple insurers for better risk management"
        ]
        
        # Risk factors
        insights["risk_factors"] = [
            "Insurers with claim ratios below 85% may pose higher risk",
            "Low customer ratings could indicate service quality issues",
            "Market share fluctuations may impact long-term stability",
            "Economic downturns can affect premium affordability",
            "Regulatory changes may impact product availability"
        ]
    
    return insights

# Analytics endpoints
@app.get("/analytics/dashboard/", response_model=Dict[str, Any])
async def get_analytics_dashboard(
    period: str = Query("30d", description="Time period: 7d, 30d, 90d, 1y"),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive analytics dashboard data"""
    from models import Customer, Recommendation, NeedsAnalysis, Report
    from sqlalchemy import func, and_
    from datetime import datetime, timedelta
    
    # Calculate date range based on period
    end_date = datetime.now()
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    elif period == "1y":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Get total customers
    customers_query = select(func.count(Customer.id))
    if period != "all":
        customers_query = customers_query.where(Customer.created_at >= start_date)
    customers_result = await db.execute(customers_query)
    total_customers = customers_result.scalar() or 0
    
    # Get total recommendations
    recommendations_query = select(func.count(Recommendation.id))
    if period != "all":
        recommendations_query = recommendations_query.where(Recommendation.created_at >= start_date)
    recommendations_result = await db.execute(recommendations_query)
    total_recommendations = recommendations_result.scalar() or 0
    
    # Get average premium from recommendations
    avg_premium_query = select(func.avg(Recommendation.premium_amount))
    if period != "all":
        avg_premium_query = avg_premium_query.where(Recommendation.created_at >= start_date)
    avg_premium_result = await db.execute(avg_premium_query)
    average_premium = avg_premium_result.scalar() or 0
    
    # Calculate conversion rate (customers with recommendations / total customers)
    conversion_rate = 0
    if total_customers > 0:
        customers_with_recommendations_query = select(func.count(func.distinct(Recommendation.customer_id)))
        if period != "all":
            customers_with_recommendations_query = customers_with_recommendations_query.where(Recommendation.created_at >= start_date)
        customers_with_recommendations_result = await db.execute(customers_with_recommendations_query)
        customers_with_recommendations = customers_with_recommendations_result.scalar() or 0
        conversion_rate = (customers_with_recommendations / total_customers) * 100
    
    # Get top products by recommendation count
    from models import Product
    top_products_query = select(
        Product.name.label('product_name'),
        func.count(Recommendation.id).label('count')
    ).select_from(Recommendation).join(Product, Recommendation.product_id == Product.id
    ).group_by(Product.name).order_by(func.count(Recommendation.id).desc()).limit(5)

    if period != "all":
        top_products_query = top_products_query.where(Recommendation.created_at >= start_date)

    top_products_result = await db.execute(top_products_query)
    top_products = [
        {"name": row.product_name, "count": row.count}
        for row in top_products_result.fetchall()
    ]
    
    # Get customer demographics
    # Age groups
    age_groups_query = select(
        func.case(
            (Customer.age < 25, "18-24"),
            (Customer.age < 35, "25-34"),
            (Customer.age < 45, "35-44"),
            (Customer.age < 55, "45-54"),
            (Customer.age < 65, "55-64"),
            else_="65+"
        ).label('age_group'),
        func.count(Customer.id).label('count')
    ).group_by('age_group').order_by('age_group')
    
    if period != "all":
        age_groups_query = age_groups_query.where(Customer.created_at >= start_date)
    
    age_groups_result = await db.execute(age_groups_query)
    age_groups = [
        {"age_group": row.age_group, "count": row.count}
        for row in age_groups_result.fetchall()
    ]
    
    # Income ranges
    income_ranges_query = select(
        func.case(
            (Customer.annual_income < 500000, "₹0-5L"),
            (Customer.annual_income < 1000000, "₹5-10L"),
            (Customer.annual_income < 2000000, "₹10-20L"),
            (Customer.annual_income < 5000000, "₹20-50L"),
            else_="₹50L+"
        ).label('income_range'),
        func.count(Customer.id).label('count')
    ).group_by('income_range').order_by('income_range')
    
    if period != "all":
        income_ranges_query = income_ranges_query.where(Customer.created_at >= start_date)
    
    income_ranges_result = await db.execute(income_ranges_query)
    income_ranges = [
        {"range": row.income_range, "count": row.count}
        for row in income_ranges_result.fetchall()
    ]
    
    # Performance metrics
    needs_analysis_query = select(func.count(NeedsAnalysis.id))
    if period != "all":
        needs_analysis_query = needs_analysis_query.where(NeedsAnalysis.analysis_date >= start_date.date())
    needs_analysis_result = await db.execute(needs_analysis_query)
    needs_analysis_completed = needs_analysis_result.scalar() or 0
    
    pdf_reports_query = select(func.count(Report.id))
    if period != "all":
        pdf_reports_query = pdf_reports_query.where(Report.created_at >= start_date)
    pdf_reports_result = await db.execute(pdf_reports_query)
    pdf_reports_created = pdf_reports_result.scalar() or 0
    
    # Recent activity
    recent_customers_query = select(Customer).order_by(Customer.created_at.desc()).limit(5)
    if period != "all":
        recent_customers_query = recent_customers_query.where(Customer.created_at >= start_date)
    recent_customers_result = await db.execute(recent_customers_query)
    recent_customers = [
        {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "created_at": customer.created_at.isoformat()
        }
        for customer in recent_customers_result.scalars().all()
    ]
    
    # Monthly trends (last 6 months)
    monthly_trends = []
    for i in range(6):
        month_start = (end_date - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        
        month_customers_query = select(func.count(Customer.id)).where(
            and_(Customer.created_at >= month_start, Customer.created_at <= month_end)
        )
        month_customers_result = await db.execute(month_customers_query)
        month_customers = month_customers_result.scalar() or 0
        
        monthly_trends.append({
            "month": month_start.strftime("%b %Y"),
            "customers": month_customers
        })
    
    monthly_trends.reverse()
    
    analytics_data = {
        "total_customers": total_customers,
        "total_recommendations": total_recommendations,
        "average_premium": round(average_premium, 2),
        "conversion_rate": round(conversion_rate, 1),
        "top_products": top_products,
        "customer_demographics": {
            "age_groups": age_groups,
            "income_ranges": income_ranges
        },
        "performance_metrics": {
            "needs_analysis_completed": needs_analysis_completed,
            "recommendations_generated": total_recommendations,
            "pdf_reports_created": pdf_reports_created
        },
        "recent_activity": {
            "recent_customers": recent_customers
        },
        "trends": {
            "monthly_customers": monthly_trends
        }
    }
    
    return analytics_data

@app.get("/analytics/customer-insights/", response_model=Dict[str, Any])
async def get_customer_insights(db: AsyncSession = Depends(get_db)):
    """Get detailed customer insights and patterns"""
    from models import Customer, Recommendation
    from sqlalchemy import func, and_
    
    # Risk appetite distribution
    risk_appetite_query = select(
        Customer.risk_appetite,
        func.count(Customer.id).label('count')
    ).group_by(Customer.risk_appetite)
    
    risk_appetite_result = await db.execute(risk_appetite_query)
    risk_appetite_distribution = [
        {"risk_level": row.risk_appetite, "count": row.count}
        for row in risk_appetite_result.fetchall()
    ]
    
    # Gender distribution
    gender_query = select(
        Customer.gender,
        func.count(Customer.id).label('count')
    ).group_by(Customer.gender)
    
    gender_result = await db.execute(gender_query)
    gender_distribution = [
        {"gender": row.gender, "count": row.count}
        for row in gender_result.fetchall()
    ]
    
    # Top insurers by recommendations
    from models import Product, Insurer
    top_insurers_query = select(
        Insurer.name.label('insurer_name'),
        func.count(Recommendation.id).label('count')
    ).select_from(Recommendation).join(Product, Recommendation.product_id == Product.id
    ).join(Insurer, Product.insurer_id == Insurer.id
    ).group_by(Insurer.name).order_by(func.count(Recommendation.id).desc()).limit(5)
    
    top_insurers_result = await db.execute(top_insurers_query)
    top_insurers = [
        {"insurer": row.insurer_name, "count": row.count}
        for row in top_insurers_result.fetchall()
    ]
    
    # Average sum assured by age group
    avg_sum_assured_query = select(
        func.case(
            (Customer.age < 25, "18-24"),
            (Customer.age < 35, "25-34"),
            (Customer.age < 45, "35-44"),
            (Customer.age < 55, "45-54"),
            (Customer.age < 65, "55-64"),
            else_="65+"
        ).label('age_group'),
        func.avg(Recommendation.sum_assured).label('avg_sum_assured')
    ).join(Recommendation, Customer.id == Recommendation.customer_id).group_by('age_group')
    
    avg_sum_assured_result = await db.execute(avg_sum_assured_query)
    avg_sum_assured_by_age = [
        {"age_group": row.age_group, "avg_sum_assured": round(row.avg_sum_assured or 0, 2)}
        for row in avg_sum_assured_result.fetchall()
    ]
    
    insights = {
        "risk_appetite_distribution": risk_appetite_distribution,
        "gender_distribution": gender_distribution,
        "top_insurers": top_insurers,
        "avg_sum_assured_by_age": avg_sum_assured_by_age
    }
    
    return insights

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)