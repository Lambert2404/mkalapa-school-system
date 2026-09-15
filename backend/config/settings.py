"""
Django settings for the Mkalapa Secondary School Management System.

NOTE: This system intentionally has NO authentication, NO login, and NO
online payment processing. See project README for details.
"""

import os
from pathlib import Path
from datetime import timedelta

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure-secret-key-change-me")

DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "django_filters",

    "students",
    "contributions",
    "sms",
    "reports",
    "settings_app",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "mkalapa_db"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = []  # No authentication in this system

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Dar_es_Salaam"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],  # No auth by design
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# ---------------------------------------------------------------------------
# SMS Gateway configuration (NextSMS "Messaging Service API V2", or a
# compatible provider). Credentials are NEVER exposed to the frontend —
# backend environment variables only.
#
# NextSMS API reference: https://documenter.getpostman.com/view/1679195/2sAYkDP1XN
#   Base URL:      https://messaging-service.co.tz
#   Auth (recommended): Bearer token -> Authorization: Bearer <SMS_ACCESS_TOKEN>
#   Auth (alternative):  Basic auth  -> base64(SMS_API_KEY:SMS_API_SECRET)
#   Single SMS (live):   POST /api/sms/v2/text/single
#   Single SMS (test):   POST /api/sms/v2/test/text/single  (no charge, dummy response)
#   Content-Type / Accept headers must both be application/json.
# ---------------------------------------------------------------------------
SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "nextsms")  # "mock" or "nextsms"

# Preferred: Bearer token auth (SMS_AUTH_METHOD=bearer, the NextSMS-recommended method)
SMS_AUTH_METHOD = os.environ.get("SMS_AUTH_METHOD", "bearer")  # "bearer" or "basic"
SMS_ACCESS_TOKEN = os.environ.get("SMS_ACCESS_TOKEN", "")

# Alternative: Basic auth (username/password from the NextSMS dashboard)
SMS_API_KEY = os.environ.get("SMS_API_KEY", "")
SMS_API_SECRET = os.environ.get("SMS_API_SECRET", "")

SMS_SENDER_ID = os.environ.get("SMS_SENDER_ID", "MKALAPA SEC")

# Toggle NextSMS's free Test Mode endpoint (dummy responses, no credits used,
# no real SMS delivered) vs. the live endpoint.
SMS_TEST_MODE = os.environ.get("SMS_TEST_MODE", "True") == "True"

SMS_LIVE_URL = "https://messaging-service.co.tz/api/sms/v2/text/single"
SMS_TEST_URL = "https://messaging-service.co.tz/api/sms/v2/test/text/single"
# Falls back to the computed test/live URL if SMS_BASE_URL is unset OR blank.
SMS_BASE_URL = os.environ.get("SMS_BASE_URL") or (SMS_TEST_URL if SMS_TEST_MODE else SMS_LIVE_URL)
