import asyncio
import os
from datetime import date
from sqlalchemy import text
from database import engine
from dotenv import load_dotenv

load_dotenv()

async def update_market_data_table():
    """Update the market_data table with new columns and populate with data"""
    async with engine.begin() as conn:
        try:
            # Add new columns if they don't exist
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS insurer_id INTEGER REFERENCES insurers(id)
            """))
            
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS claim_settlement_ratio FLOAT
            """))
            
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS rating FLOAT
            """))
            
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS market_share FLOAT
            """))
            
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS premium_growth FLOAT
            """))
            
            await conn.execute(text("""
                ALTER TABLE market_data 
                ADD COLUMN IF NOT EXISTS customer_satisfaction FLOAT
            """))
            
            # Clear existing market data
            await conn.execute(text("DELETE FROM market_data"))
            
            # Insert new market data for each insurer
            market_data_list = [
                (1, 98.31, 4.5, 25.5, 12.3, 4.2),  # LIC
                (2, 99.04, 4.3, 18.2, 15.7, 4.4),  # HDFC Life
                (3, 98.58, 4.4, 16.8, 14.2, 4.3),  # ICICI Prudential
                (4, 98.03, 4.2, 12.5, 11.8, 4.1),  # SBI Life
                (5, 99.34, 4.1, 8.7, 13.5, 4.0),   # Max Life
            ]
            
            for insurer_id, claim_ratio, rating, market_share, premium_growth, satisfaction in market_data_list:
                await conn.execute(text("""
                    INSERT INTO market_data (
                        insurer_id, date, claim_settlement_ratio, rating, market_share, 
                        premium_growth, customer_satisfaction, inflation_rate, repo_rate, 
                        gdp_growth, market_cap
                    ) VALUES (
                        :insurer_id, :date, :claim_ratio, :rating, :market_share,
                        :premium_growth, :satisfaction, 6.5, 6.5, 7.2, 3500000.0
                    )
                """), {
                    "insurer_id": insurer_id,
                    "date": date.today(),
                    "claim_ratio": claim_ratio,
                    "rating": rating,
                    "market_share": market_share,
                    "premium_growth": premium_growth,
                    "satisfaction": satisfaction
                })
            
            print("Market data table updated and populated successfully!")
            
        except Exception as e:
            print(f"Error updating table: {e}")

if __name__ == "__main__":
    asyncio.run(update_market_data_table()) 