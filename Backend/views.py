from django.shortcuts import render
import requests
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])  # Ensure that this view only accepts GET requests
def get_meal_ingredients(request):
    url = 'https://my.pomona.edu/eatec/Frank.json'
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP request errors
        
        # Strip the JSONP padding (assuming response is wrapped in menuData())
        data = response.text
        json_str = data[data.index('(') + 1 : data.rindex(')')]
        meals_data = json.loads(json_str)
        
        ingredients = {}
        
        # Navigate through the JSON structure based on your description
        for menu in meals_data.get("EatecExchange", {}).get("menu", []):
            meal_name = menu.get("@name", "No meal name")
            if "recipes" in menu and "recipe" in menu["recipes"]:
                if isinstance(menu["recipes"]["recipe"], list):
                    for recipe in menu["recipes"]["recipe"]:
                        dish = recipe.get("@description", "No description")
                        ingredient_list = recipe.get("ingredients", {}).get("#cdata-section", "")
                        ingredients[dish] = ingredient_list
                else:  # handle single recipe case
                    dish = menu["recipes"]["recipe"].get("@description", "No description")
                    ingredient_list = menu["recipes"]["recipe"].get("ingredients", {}).get("#cdata-section", "")
                    ingredients[dish] = ingredient_list

        return JsonResponse(ingredients)
    
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)





def show_example(request):
    return render(request, 'test.html')

def show_menu(request):
    return render(request, 'menu.html')

