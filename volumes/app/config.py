from datetime import timedelta

SECRET_KEY = 'Zwp13W2517wADbzi9Mv179Q4A9cxfqJG'
PERMANENT_SESSION_LIFETIME = timedelta(minutes=15)
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_DATABASE_URI = 'sqlite:////opt/qcmMaker/db/quiz.db'

LDAP_SCHEMA = 'ldap'
LDAP_DOMAIN = 'qcmMaker.int'
LDAP_HOST = 'ldap'
LDAP_PORT = 389
LDAP_USE_SSL = False
LDAP_BASE_DN = 'OU=Domain Users,DC=qcmMaker,DC=int'
LDAP_BIND_DIRECT_CREDENTIALS = True
LDAP_USERNAME = 'connector'
LDAP_PASSWORD = 'Password1'