FROM python:3.11.8-bookworm

WORKDIR /app

# Oracle Instant Client
# https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html
# https://help.ubuntu.com/community/Oracle%20Instant%20Client
COPY ./docker /app/docker/
RUN apt update; \
    apt install -y alien; \
    alien -i /app/docker/development/oracle-instantclient*.rpm; \
    apt install -y libaio1; \
    echo /usr/lib/oracle/21/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf; \
    ldconfig

# Install python dependencies
COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
EXPOSE 8000