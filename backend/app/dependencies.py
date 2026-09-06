# app/dependencies.py
from tempfile import SpooledTemporaryFile
from fastapi import File, HTTPException, Header, UploadFile
from PIL import Image
import PyPDF2


async def get_token_header(token: str = Header(None)):
    return {"Authorization": f"Bearer {token}"}


# Se mudar o nome do parâmetro, front-end deve ser atualizado
# No caso do dropzone, a configuração para o nome do parâmetro é paramName.
# Por default, dropzone envia o arquivo com o nome file
async def get_valid_anexo(
    file: UploadFile = File(..., description="Arquivo a ser anexado")
):
    if file.content_type not in ("image/jpeg", "image/png", "application/pdf"):
        raise HTTPException(
            status_code=415,
            detail="Formato de arquivo inválido. Formatos permitidos: JPEG, PNG e PDF",
        )

    if file.size > 20 * 1024**2 and file.content_type in (
        "image/jpeg",
        "image/png",
    ):
        print(file.size)
        raise HTTPException(status_code=413, detail="Tamanho máximo excedido (20MB)")

    if file.size > 5 * 1024**2 and file.content_type == "application/pdf":
        raise HTTPException(status_code=413, detail="Tamanho máximo excedido (5MB)")

    # Verifica se o arquivo de imagem é válido
    if file.content_type in ("image/jpeg", "image/png"):
        try:
            img = Image.open(file.file)
            img.verify()

        except Exception as e:
            raise HTTPException(status_code=415, detail="Arquivo de imagem inválido")

    # Verifica se o arquivo PDF é válido
    if file.content_type == "application/pdf":
        try:
            pdf = PyPDF2.PdfReader(file.file)
            assert len(pdf.pages) > 0

        except Exception as e:
            raise HTTPException(status_code=415, detail="Arquivo PDF inválido")

    # Retorna o ponteiro do arquivo para o início
    # Image.open(anexo.file) e PyPDF2.PdfFileReader(anexo.file) consomem o arquivo
    await file.seek(0)

    return file
