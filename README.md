# VanthAI

VanthAI is a unified AI-powered platform serving CloudCare and ITR Portal agents. It provides a seamless, multi-modal interaction experience using text and voice, orchestrated via a robust FastAPI backend and a modern React frontend.

## Project Structure

- **PRD_Frontend_v2.md**: Detailed requirements and design for the VanthAI Frontend.
- **PRD_Backend_v2.md**: Detailed requirements and design for the VanthAI Backend.
- **frontend/**: The React-based frontend application.
- **backend/**: (In Development) The FastAPI-based backend application.
- **ERP-SIH/**: Base frontend components ported from the ERP-SIH project.

## Key Features

- **Unified AI Agents**: CloudCare (Health) and ITR (Tax) assistants in one platform.
- **Multi-modal Interaction**: Support for both text-based chat and voice-driven navigation.
- **Visual Guidance**: Integrated Driver.js and Shepherd.js for spotlighting and interactive tours.
- **Streaming Responses**: Real-time streaming of thinking blocks, tool calls, and agent responses.
- **Ephemeral Sessions**: Stateless architecture with session data stored in Redis.

## Getting Started

Refer to the individual PRDs for technical details and environment configuration:
- [Frontend PRD](./PRD_Frontend_v2.md)
- [Backend PRD](./PRD_Backend_v2.md)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Driver.js, Shepherd.js.
- **Backend**: FastAPI, LangGraph, PostgreSQL, Redis, Docker.
- **LLM**: Google Gemini (via LangChain), Gemma (via LM Studio).

---
© 2026 VanthAI Team
