from django.contrib import admin
from django.urls import include, path
from views import show_example, show_menu, get_meal_ingredients
urlpatterns = [
    path('', show_example, name='home'),  # Root URL
    path('admin/', admin.site.urls),      # Admin site
    path('menu/', get_meal_ingredients, name="menu"),
]
