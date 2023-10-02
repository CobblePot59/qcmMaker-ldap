FROM python:slim-buster

WORKDIR /opt/qcmMaker

RUN apt update -y && \
    apt-get install -y --no-install-recommends gcc libsasl2-dev libldap2-dev && \
    python3 -m pip install --no-cache-dir gunicorn Flask==2.3.3 flask-sqlalchemy flask-ldap3-login flask-toastr hashids 

EXPOSE 80

CMD ["gunicorn", "wsgi:app", "--bind=0.0.0.0:80", "--workers=4", "--reload"]