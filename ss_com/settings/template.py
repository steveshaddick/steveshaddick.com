# Load defaults in order to then add/override with dev-only settings
from defaults import *

DEBUG = _DEBUG_

ENVIRONMENT = '_ENVIRONMENT_'

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['_ALLOWED_HOST_']

SENDGRID = {
    'username': "_SENDGRID_USER_",
    'password': "_SENDGRID_PASSWORD_",
}

DATABASES = {
    'default': {
        'ENGINE': '_DB_ENGINE_',  # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '_DB_NAME_',    # Or path to database file if using sqlite3.
        'USER': '_DB_USER_',
        'PASSWORD': '_DB_PASSWORD_',
        'HOST': '',               # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',               # Set to empty string for default.
    }
}

# Make this unique, and don't share it with anybody.
SECRET_KEY = '_SECRET_KEY_'

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = '/home/steveshaddick/projects/steveshaddick.com/media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = 'http://steveshaddick.com/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_ROOT, '../static'),
)
