from django.contrib import admin
from django.urls import include, path
from views import show_example, show_menu, your_view_name, filtered_meals_view
urlpatterns = [
    path('', show_menu, name='home'),  # Root URL
    path('your-url/', your_view_name, name='your_view_name'),
    path('admin/', admin.site.urls),      # Admin site
    path('filtered-meals/', filtered_meals_view, name='filtered_meals_url'),
    # path('menu/', get_meal_ingredients, name="menu"),
    #path('menu/', filter_meal_ingredients_frank, name="menu"),
]
