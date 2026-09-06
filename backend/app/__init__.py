# app/__init__.py
from fastapi import FastAPI
from app.dependencies import get_token_header

app = FastAPI()

# Additional app-level configurations, if any.
