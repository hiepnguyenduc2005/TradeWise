from django.apps import AppConfig

class TradewiseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tradewise'

    def ready(self):
        import tradewise.signals
