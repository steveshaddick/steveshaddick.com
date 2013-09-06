


def common(request):
	from django.conf import settings
	return {
		'GOOGLE_UA': settings.GOOGLE_UA,
		'ENVIRONMENT': settings.ENVIRONMENT
	}