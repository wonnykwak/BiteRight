from django.shortcuts import render
import requests
import json
import re  
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from openai import OpenAI
client = OpenAI()



celiacDisease=["wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour"]
inflammatoryBowelDiseaseIBD=["milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","caffeine"]
polycysticOvarySyndrome=["vegetableoil","vegetable","canolaoil","canola","ornoil","palmoil","palm","palmfruit","margarine","beef","beefstock","ham","pork","lamb","cornsyrup","dextrose","whiterice"]
rheumatoidArthritis=["milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","vegetableoil","vegetable","canolaoil","canola","ornoil","palmoil","palm","palmfruit"]
hashimotosDisease=["wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","iodine"]
lupus=["alfalfa","garlic"]
type1Diabetes=["wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour"]
psoriasis=["beef","beefstock","ham","pork","lamb","milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","eggplant"]
hinduism=["beef","beefstock","ham","pork","lamb","chicken","turkey","duck","salmon","tuna","shrimp","crab","lobster","crawfish","prawns","squid","octopus","mussels","clams","oysters","scallops","abalone","mollusks","fish","cod","mackerel","sardines","trout","goose","pheasant"]
buddhism=["beef","beefstock","ham","pork","lamb","chicken","turkey","duck","goose","pheasant"]
islam=["pork"]
seventhDayAdventists=["beef","beefstock","ham","pork","lamb","chicken","turkey","duck","goose","pheasant"]
lactoseIntolerance=["milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese"]
glutenIntolerance=["wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour"]
histamineIntolerance=["kimchi","sauerkraut","yogurt","miso","sourdough","applecidervinegar"]
fructoseIntolerance=["honey","highfructosecornsyrup"]
eggAllergyIntolerance=["egg", "cagefreewholeeggs", "eggwhites"]
peanutAllergy=["peanut"]
treeNutAllergy=["brazilnuts","hazelnut","macadamianut","pecan","pistachio","almond","walnut","cashew"]
fishAllergy=["pollock","salmon","cod","tuna","snapper","eel","tilapia","mackerel","sardines","trout"]
shellfishAllergy=["shrimp","crab","lobster","crawfish","prawns","squid","octopus","mussels","clams","oysters","scallops","abalone","mollusks"]
soyAllergy=["soy"]
wheatAllergy=["wheat"]
irritableBowelSyndromeIBS=["milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour","garlic","onion","legume","bean","lentil"]
crohnsDisease=["wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour","milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese","prune","beef","beefstock","ham","pork","lamb"]
diverticulitis=["nut","seed","wheat","wheatgluten","hydrolizedwheatgluten","hydrolizedwheatprotein","wheatflour","enrichedwheatflour","enrichedunbleachedwheatflour","bleachedwheatflour","enrichedbleachedwheatflour","wheatstarch","bulgarwheat","vitalwheatgluten","barley","barleyflour","maltedbarleyflour","rye","ryeflour","beef","beefstock","ham","pork","lamb"]
pancreatitis=["beef","beefstock","ham","pork","lamb","milk","cheese","yogurt","butter","cream","sourcream","clottedcream","icecream","cottagecheese"]
pepticUlcers=["pepper","curry","spicy","tomato","mint","lime","lemon","plum","grapefruit","grape","blueberry","pineapple","orange","peach","beef","beefstock","ham","pork","lamb","chili","pepper","spicy"]

CONDITIONS_TO_INGREDIENTS = {
    "Celiac": celiacDisease,
    "IBD": inflammatoryBowelDiseaseIBD,
    "PCOS": polycysticOvarySyndrome,
    "RA": rheumatoidArthritis,
    "Hashimoto": hashimotosDisease,
    "Lupus": lupus,
    "Type1Diabetes": type1Diabetes,
    "Psoriasis": psoriasis,
    "Hinduism": hinduism,
    "Buddhism": buddhism,
    "Islam": islam,
    "SeventhDayAdventists": seventhDayAdventists,
    "Lactose": lactoseIntolerance,
    "Gluten": glutenIntolerance,
    "Histamine": histamineIntolerance,
    "Fructose": fructoseIntolerance,
    "Egg": eggAllergyIntolerance,
    "Peanut": peanutAllergy,
    "TreeNut": treeNutAllergy,
    "Fish": fishAllergy,
    "Shellfish": shellfishAllergy,
    "Soy": soyAllergy,
    "Wheat": wheatAllergy,
    "IBS": irritableBowelSyndromeIBS,
    "Crohns": crohnsDisease,
    "Diverticulitis": diverticulitis,
    "Pancreatitis": pancreatitis,
    "PepticUlcers": pepticUlcers
}

from django.shortcuts import render
import requests
import json
import re
from django.views.decorators.http import require_http_methods

from django.shortcuts import render
import requests
import json
import re
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def filter_meal_ingredients_combined(request):
    dining_urls = {
        'Frank': 'https://my.pomona.edu/eatec/Frank.json',
        'Frary': 'https://my.pomona.edu/eatec/Frary.json'
    }
    unwanted_ingredients = request.session.get('unwanted_ingredients', [])
    meals_by_dining_hall = {'Frank': {'Breakfast': [], 'Lunch': [], 'Dinner': []},
                            'Frary': {'Breakfast': [], 'Lunch': [], 'Dinner': []}}

    serve_date = request.GET.get('serve_date', '20240415')  

    ingredient_delimiter = re.compile(r'[;,]|\(|\)|\band\b')

    for dining_hall, url in dining_urls.items():
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.text
            json_str = data[data.index('(') + 1 : data.rindex(')')]
            meals_data = json.loads(json_str)

            for menu in meals_data.get("EatecExchange", {}).get("menu", []):
                menu_serve_date = menu.get("@servedate", "")
                if serve_date and menu_serve_date != serve_date:
                    continue

                meal_period = menu.get("@mealperiodname", "Unknown")
                recipes = menu.get("recipes", {}).get("recipe", [])
                if isinstance(recipes, dict):
                    recipes = [recipes]

                for recipe in recipes:
                    ingredients_text = recipe.get("ingredients", {}).get("#cdata-section", "")
                    ingredients_list = [ingredient.strip().lower() for ingredient in ingredient_delimiter.split(ingredients_text) if ingredient.strip()]

                    if not any(unwanted.lower() in ingredient for ingredient in ingredients_list for unwanted in unwanted_ingredients):
                        description = recipe.get("@description", "No description")
                        meals_by_dining_hall[dining_hall][meal_period].append(description)


        except requests.RequestException as e:
            continue  
    
    meals_by_dining_hall_str = json.dumps(meals_by_dining_hall, indent=2) 
    unwanted_ingredients_str = json.dumps(unwanted_ingredients)


    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are an assertive dietician, skilled in giving firm advice regarding which dining hall to pick given the options and the user's health problems. Your choices lie here:\n" + meals_by_dining_hall_str + "you also know which foods to avoid like: " + unwanted_ingredients_str
            },
            {
                "role": "user",
                "content": "Let the user know which dining hall to choose from Frary and Frank and explain why dependent on the time as well."
            }
        ]
    )

    

    context = {'meals_by_dining_hall': meals_by_dining_hall,
               'ai_message': completion.choices[0].message.content
               }
    return render(request, 'meal_display.html', context)


def your_view_name(request):
    if request.method == 'POST':
        selectedCategories = []

        for condition, ingredients in CONDITIONS_TO_INGREDIENTS.items():
            if condition in request.POST:
                selectedCategories.extend(ingredients)
                print(f"{condition} checkbox is checked. Adding ingredients: {ingredients}")

        request.session['unwanted_ingredients'] = selectedCategories  

       
        return redirect('filtered_meals_url')

    return render(request, 'menu.html')

def filtered_meals_view(request):
    return filter_meal_ingredients_combined(request)
    # return filter_meal_ingredients_frank(request)

def show_example(request):
    return render(request, 'test.html')

def show_menu(request):
    return render(request, 'menu.html')

