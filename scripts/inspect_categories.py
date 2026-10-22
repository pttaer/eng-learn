import json
from collections import Counter

with open('data/scraped_ielts_vocab_raw.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)

print(f"Total topics: {len(topics)}")

# Collect all topic titles
topic_titles = [t['title'] for t in topics]
print(f"Sample 30 topic titles:\n", topic_titles[:30])

# Map to canonical broad categories
CATEGORY_MAP = {
    # Environment & Nature
    'sustainable-tourism': 'environment',
    'environmental-protection': 'environment',
    'climate-change': 'environment',
    'biodiversity': 'environment',
    'pollution': 'environment',
    'renewable-energy': 'energy',
    'energy-conservation': 'energy',
    # Technology & Science
    'artificial-intelligence': 'technology',
    'digital-media': 'technology',
    'cybersecurity': 'technology',
    'scientific-research': 'science',
    'medical-technology': 'science',
    # Society & Culture
    'cultural-impact-society': 'arts',
    'cultural-heritage': 'arts',
    'visual-arts': 'arts',
    'performing-arts': 'arts',
    'film-and-television': 'media',
    # Education
    'higher-education': 'education',
    'standardized-tests': 'education',
    'lifelong-learning': 'education',
    # Work & Economy
    'workplace-culture': 'work',
    'workforce-trends': 'work',
    'economic-indicators': 'globalisation',
    'economic-systems': 'globalisation',
}

# Check word counts per topic
counts = [t['count'] for t in topics]
print(f"Min items: {min(counts)}, Max items: {max(counts)}, Avg: {sum(counts)/len(counts):.1f}")
