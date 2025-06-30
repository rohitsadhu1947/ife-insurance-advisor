from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
import os
from datetime import datetime
from typing import Dict, Any

class PDFReportService:
    """Service for generating PDF reports"""
    
    @staticmethod
    def create_needs_analysis_report(data: Dict[str, Any]) -> BytesIO:
        """Create a comprehensive needs analysis PDF report"""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        story.append(Paragraph("Life Insurance Needs Analysis Report", title_style))
        story.append(Spacer(1, 20))
        
        # Customer Information
        story.append(Paragraph("Customer Information", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        customer_info = data.get('customer_info', {})
        customer_table_data = [
            ['Name', customer_info.get('name', 'N/A')],
            ['Age', str(customer_info.get('age', 'N/A'))],
            ['Occupation', customer_info.get('occupation', 'N/A')],
            ['Annual Income', f"₹{customer_info.get('annual_income', 0):,.0f}"],
            ['Family Size', str(customer_info.get('family_size', 'N/A'))]
        ]
        
        customer_table = Table(customer_table_data, colWidths=[2*inch, 4*inch])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(customer_table)
        story.append(Spacer(1, 20))
        
        # Needs Analysis
        story.append(Paragraph("Insurance Needs Analysis", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        needs_analysis = data.get('needs_analysis', {})
        needs_table_data = [
            ['Parameter', 'Amount (₹)'],
            ['Human Life Value', f"{needs_analysis.get('human_life_value', 0):,.0f}"],
            ['Total Insurance Needs', f"{needs_analysis.get('total_insurance_needs', 0):,.0f}"],
            ['Existing Coverage', f"{needs_analysis.get('existing_coverage', 0):,.0f}"],
            ['Additional Coverage Needed', f"{needs_analysis.get('additional_coverage_needed', 0):,.0f}"]
        ]
        
        needs_table = Table(needs_table_data, colWidths=[3*inch, 3*inch])
        needs_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(needs_table)
        story.append(Spacer(1, 20))
        
        # Recommendations
        story.append(Paragraph("Recommended Insurance Products", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        recommendations = data.get('recommendations', [])
        if recommendations:
            rec_table_data = [['Product', 'Insurer', 'Sum Assured', 'Premium', 'Priority']]
            
            for rec in recommendations:
                rec_table_data.append([
                    rec.get('product_name', 'N/A'),
                    rec.get('insurer', 'N/A'),
                    f"₹{rec.get('sum_assured', 0):,.0f}",
                    f"₹{rec.get('premium', 0):,.0f}",
                    rec.get('priority', 'N/A').upper()
                ])
            
            rec_table = Table(rec_table_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1*inch, 1*inch])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9)
            ]))
            story.append(rec_table)
        else:
            story.append(Paragraph("No recommendations available.", styles['Normal']))
        
        story.append(Spacer(1, 20))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        story.append(Paragraph(f"Report generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", footer_style))
        story.append(Paragraph("Life Insurance Advisor - Indian Market Focus", footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def create_product_comparison_report(data: Dict[str, Any]) -> BytesIO:
        """Create a product comparison PDF report"""
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        story.append(Paragraph("Insurance Product Comparison Report", title_style))
        story.append(Spacer(1, 20))
        
        # Product Comparison Table
        products = data.get('products', [])
        if products:
            comparison_data = [['Product', 'Insurer', 'Type', 'Premium', 'Rating']]
            
            for product in products:
                comparison_data.append([
                    product.get('name', 'N/A'),
                    product.get('insurer', 'N/A'),
                    product.get('product_type', 'N/A').replace('_', ' ').title(),
                    f"₹{product.get('premium', 0):,.0f}",
                    f"{product.get('rating', 0):.1f}"
                ])
            
            comparison_table = Table(comparison_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1*inch])
            comparison_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9)
            ]))
            story.append(comparison_table)
        
        story.append(Spacer(1, 20))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        story.append(Paragraph(f"Report generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", footer_style))
        
        doc.build(story)
        buffer.seek(0)
        return buffer 