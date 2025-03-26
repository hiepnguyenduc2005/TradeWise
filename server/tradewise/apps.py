from django.apps import AppConfig

class TradewiseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tradewise'

    def ready(self):
        import tradewise.signals
        from django.db.models.signals import post_migrate
        post_migrate.connect(create_roles, sender=self)

def create_roles(sender, **kwargs):
    from django.contrib.auth.models import Group
    expert_group, created = Group.objects.get_or_create(name='Expert')
    if created:
        print('Admin group created')

    premium_group, created = Group.objects.get_or_create(name='Premium User')
    if created:
        print('Manager group created')

    user_group, created = Group.objects.get_or_create(name='User')
    if created:
        print('User group created')
