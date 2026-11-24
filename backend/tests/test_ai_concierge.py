"""
Unit & Integration Tests for AI Concierge & RAG Engine
in Digital Shagun & Wedding Gift Crowdfunding Platform.
"""

import pytest
from app.services.rag_service import AIWeddingConciergeRAG, concierge_rag


def test_rag_engine_index_initialized():
    """Verify RAG engine indexes default registry goals."""
    assert len(concierge_rag.registry_docs) >= 4
    assert concierge_rag.doc_vectors is not None
    assert concierge_rag.doc_vectors.shape[0] == len(concierge_rag.registry_docs)


def test_rag_recommendation_hiking_camping():
    """Verify outdoor query maps to hiking gear with high relevance."""
    res = concierge_rag.recommend_registry_goals(
        query="hiking gear tents and mountains with college friends",
        budget=5000.0,
        top_k=1
    )
    assert res["query"] == "hiking gear tents and mountains with college friends"
    assert res["latency_ms"] < 20.0  # Sub-20 ms retrieval
    assert len(res["recommendations"]) == 1
    top = res["recommendations"][0]
    assert "Hiking" in top["title"] or "Outdoor" in top["category"]
    assert top["relevance_score"] > 0.1
    assert top["citation_grounding"] == "100% verified against couple registry goals"


def test_rag_recommendation_honeymoon():
    """Verify honeymoon query maps to Amalfi Coast fund."""
    res = concierge_rag.recommend_registry_goals(
        query="honeymoon romantic beach trip italy flights",
        budget=11000.0,
        top_k=1
    )
    assert len(res["recommendations"]) == 1
    top = res["recommendations"][0]
    assert "Honeymoon" in top["title"]
    assert top["suggested_shagun"] == 11000


def test_generate_cultural_blessing():
    """Verify culturally grounded blessing note creation."""
    blessing = concierge_rag.generate_personalized_blessing(
        guest_name="Kavita Sharma",
        relationship="college_friend",
        goal_title="Amalfi Coast Honeymoon Fund"
    )
    assert blessing["guest_name"] == "Kavita Sharma"
    assert "college" in blessing["blessing_note"].lower()
    assert "Amalfi Coast Honeymoon Fund" in blessing["blessing_note"]


def test_generate_couple_thank_you():
    """Verify 1-click WhatsApp thank-you synthesizer."""
    msg_data = concierge_rag.generate_couple_thank_you(
        guest_name="Vikram Singh",
        amount=5001.0,
        goal_title="First Home Down Payment"
    )
    assert "Vikram Singh" in msg_data["whatsapp_message"]
    assert "₹5,001" in msg_data["whatsapp_message"]
    assert "First Home Down Payment" in msg_data["whatsapp_message"]


@pytest.mark.asyncio
async def test_ai_api_endpoint(client):
    """Integration test for /api/v1/ai/recommend endpoint."""
    response = await client.post(
        "/api/v1/ai/recommend",
        json={
            "query": "coffee machine espresso barista kitchen",
            "budget": 2100.0,
            "top_k": 2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 2
    assert "Espresso" in data["recommendations"][0]["title"] or "Kitchen" in data["recommendations"][0]["title"]
