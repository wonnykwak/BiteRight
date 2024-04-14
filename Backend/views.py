from django.shortcuts import render

def show_example(request):
    return render(request, 'test.html')
