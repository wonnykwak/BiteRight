from django.contrib import admin
from django.urls import include, path
from views import show_example 
urlpatterns = [
    path('', show_example, name='home'),  # Root URL
    path('admin/', admin.site.urls),      # Admin site
]
