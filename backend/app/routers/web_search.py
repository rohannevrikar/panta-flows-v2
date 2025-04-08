from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from duckduckgo_search import AsyncDDGS
import asyncio
import time
import random
import logging
import json
import traceback
import aiohttp
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

class WebSearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5
    fetch_content: Optional[bool] = True

class WebSearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    date: Optional[str] = None
    source: Optional[str] = None
    relevance_score: Optional[float] = None
    content_summary: Optional[str] = None
    key_points: Optional[List[str]] = None

async def fetch_page_content(url: str, timeout: int = 10) -> Optional[str]:
    """
    Fetch the HTML content of a URL and extract the main text content.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=timeout) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch {url}: Status code {response.status}")
                    return None
                
                html = await response.text()
                
                # Parse HTML with BeautifulSoup
                soup = BeautifulSoup(html, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.extract()
                
                # Get text content
                text = soup.get_text(separator=' ', strip=True)
                
                # Clean up text (remove extra whitespace, etc.)
                text = re.sub(r'\s+', ' ', text).strip()
                
                return text
    except Exception as e:
        logger.error(f"Error fetching {url}: {str(e)}")
        return None

async def analyze_content(content: str, query: str) -> Dict[str, Any]:
    """
    Analyze the content to extract relevant information based on the query.
    """
    if not content:
        return {
            'summary': None,
            'key_points': [],
            'relevance_score': 0.0
        }
    
    # Simple relevance scoring based on query term frequency
    query_terms = query.lower().split()
    content_lower = content.lower()
    
    # Calculate term frequency score
    term_frequency = sum(content_lower.count(term) for term in query_terms)
    relevance_score = min(1.0, term_frequency / (len(query_terms) * 10))
    
    # Extract key sentences (simple approach)
    sentences = re.split(r'(?<=[.!?])\s+', content)
    
    # Score sentences based on query term presence
    scored_sentences = []
    for sentence in sentences:
        score = sum(sentence.lower().count(term) for term in query_terms)
        if score > 0:
            scored_sentences.append((score, sentence))
    
    # Sort by score and take top 5
    scored_sentences.sort(reverse=True)
    key_points = [sentence for _, sentence in scored_sentences[:5]]
    
    # Generate a summary (first few sentences or a portion of the content)
    summary = ' '.join(sentences[:3]) if sentences else None
    if summary and len(summary) > 500:
        summary = summary[:500] + "..."
    
    return {
        'summary': summary,
        'key_points': key_points,
        'relevance_score': relevance_score
    }

async def perform_search(query: str, max_results: int = 5, max_retries: int = 3, fetch_content: bool = True) -> List[dict]:
    """
    Perform a DuckDuckGo search with retry logic and proper async handling.
    Optionally fetch and analyze the content of linked pages.
    """
    logger.debug(f"Starting web search for query: {query}")
    
    for attempt in range(max_retries):
        try:
            logger.debug(f"Search attempt {attempt + 1}/{max_retries}")
            
            # Add a random delay between retries
            if attempt > 0:
                delay = random.uniform(2.0, 5.0)
                logger.debug(f"Retrying in {delay:.1f} seconds")
                await asyncio.sleep(delay)

            async with AsyncDDGS() as ddgs:
                results = []
                try:
                    async for result in ddgs.text(
                        query,
                        max_results=max_results,
                        backend="lite"
                    ):
                        logger.debug(f"Received result: {json.dumps(result, indent=2)}")
                        # Check for URL in different possible fields
                        url = result.get('link', '') or result.get('url', '') or result.get('href', '')
                        
                        # Create the base result
                        search_result = {
                            'title': result.get('title', ''),
                            'url': url,
                            'snippet': result.get('body', ''),
                            'date': result.get('date', ''),
                            'source': result.get('source', ''),
                            'relevance_score': None,
                            'content_summary': None,
                            'key_points': []
                        }
                        
                        # Fetch and analyze content if requested and URL is valid
                        if fetch_content and url and urlparse(url).scheme in ['http', 'https']:
                            try:
                                content = await fetch_page_content(url)
                                if content:
                                    analysis = await analyze_content(content, query)
                                    search_result.update({
                                        'relevance_score': analysis['relevance_score'],
                                        'content_summary': analysis['summary'],
                                        'key_points': analysis['key_points']
                                    })
                            except Exception as content_error:
                                logger.error(f"Error analyzing content for {url}: {str(content_error)}")
                        
                        results.append(search_result)
                except Exception as search_error:
                    logger.error(f"Error during search iteration: {str(search_error)}")
                    raise
                
                logger.debug(f"Search completed successfully with {len(results)} results")
                return results

        except Exception as e:
            logger.error(f"Error in attempt {attempt + 1}: {str(e)}")
            logger.error(traceback.format_exc())
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=500,
                    detail=f"Search failed after {max_retries} attempts: {str(e)}"
                )
            await asyncio.sleep(1)

    return []

@router.post("/search", response_model=List[WebSearchResult])
async def search(request: WebSearchRequest):
    """
    Perform a web search and optionally fetch and analyze the content of linked pages.
    """
    try:
        results = await perform_search(
            query=request.query,
            max_results=request.max_results,
            fetch_content=request.fetch_content
        )
        return results
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )