# main.py
from fastapi import FastAPI
from app.routes import user, prestacao, receita, dev, auth, curador, curatelado
from starlette.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API do Sistema de Prestação de Contas em Curatela",
    description="",
    version="0.0.1",
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(curador.router)
app.include_router(curatelado.router)
app.include_router(prestacao.router)
app.include_router(receita.router)
app.include_router(dev.router)

# CORS
origins = [
    "http://localhost:4200",
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# redireciona '/' para '/docs'
@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
