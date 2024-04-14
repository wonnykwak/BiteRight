/*

Builds out our menu pages from json feeds.

example: https://www.pomona.edu/administration/dining/menus/frary

*/


jQuery ( document ).ready(function() {
	pull_menu_timeout = 8000; //how long we allow the json call to go before we give up
	function menuQueryFailed () {
		//do something if the jsonp query failed
		console.log("failed");
		} // end menuQueryFailed
		
	function menuQueryComplete () {
		console.log("complete");
		jQuery("#dining-menu-from-json").html(food_legend_html + final_menu_html);	
		var flCheckbox = jQuery('.food-legend input:checkbox');

		jQuery('.nutrition-facts').hide();

		// show and hide the nutrition facts
		jQuery('.nutrition-btn').click(function() {
			jQuery(this).siblings('.nutrition-facts').toggle();
			jQuery(this).toggleClass('active-nutrition-btn');
			});

		// adding aria labels to the icons (not valid to add aria-label to span, so commenting out below)
		/*
		jQuery('span.nutrition-icon').each(function() {
			jQuery(this).attr("aria-label", function () {
				return this.className.split(' ')[1] + ' ' + 'icon';
				})
			});	
		*/
		flCheckbox.change(function() {

			var removeMenuOptions = jQuery('.remove-menu-options input:checkbox');
			var removeMenuOptionsLength = removeMenuOptions.length; 
			var showMenuOptions = jQuery('.show-menu-options input:checkbox');

			jQuery('.menu-nutrition-item').removeClass('hidden-menu-item');
			jQuery('p.nutrition-menu-no-items').remove();

			jQuery(removeMenuOptions).each(function(i) {

				if (jQuery(this).is(':checked')) {

					jQuery('.menu-nutrition .' + this.name).parents('.menu-nutrition-item').addClass('hidden-menu-item');
					}

				if (i === (removeMenuOptionsLength - 1)) {

					jQuery(showMenuOptions).each(function() {

						if (jQuery(this).is(':checked')) {
							var optionItem = '.' + this.name;
							//console.log(optionItem);
							jQuery('.nutrition-name-icons:not(:has('+ optionItem +'))').parents('.menu-nutrition-item').addClass('hidden-menu-item');
							}
						});					
					}			
				});

			// if a section is empty add a No Items message
			jQuery('.nutrition-menu-section').each(function() {

				if (jQuery(this).children('.menu-nutrition-item').length == jQuery(this).children('.menu-nutrition-item.hidden-menu-item').length) {
					jQuery(this).append('<p class="nutrition-menu-no-items bg-pttrn-lt-grey p-10">No items</p>');
					}
				});

			});
		jQuery(".js-accordion").accordion();
		jQuery('.js-accordion').on('click', "button.js-accordion__header.accordion__header", function (e) {
    
		    var panelHeadingHeight = jQuery('button.js-accordion__header.accordion__header').height();
		    var animationSpeed = 500; // animation speed in milliseconds
		    var currentScrollbarPosition = jQuery(document).scrollTop();
		    var topOfPanelContent = jQuery(e.target).offset().top;

		    if ( currentScrollbarPosition >  topOfPanelContent - panelHeadingHeight) {
		        jQuery("html, body").animate({ scrollTop: topOfPanelContent - panelHeadingHeight - 100 }, animationSpeed);
		    }
		    
		    //console.log("clicked an accordion pane")
			});
		} // end menuQueryComplete
	
	 if (jQuery('#dining-menu-from-json').length) {
     	var diningMenuJSONUrl = jQuery('#dining-menu-from-json').attr('data-dining-menu-json-url');
		function pullMenuData(number_of_requests) {
			jQuery.jsonp({
				"url": diningMenuJSONUrl,
				"timeout": pull_menu_timeout, //millisecond timeout
				"callback": 'menuData',
				"success": function(data) {
					//console.log("success: " + data);
					temp_date = '';
					temp_meal = '';
					temp_html = '';
					food_legend_html ='';
					final_menu_html = '';

					var hideFoodArray = new Array(); //array that will hold the names of foods that will be "click to remove"
					var showFoodArray = new Array(); //array that will hold the names of foods that will be "click to show only"
					var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
					var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

					function returnFoodLegendHTML (recipeJSON) { //returns HTML for show/hide checkboxes
						var treeNutAdded = false;
						jQuery.each(recipeJSON.allergens.allergen, function(i3,item3) { //go through each food item for this station
							//console.log(item3['@id'] + " - " + item3['#text']);
							var treeNutCheck = (item3['@id']).slice(0,8) == "Tree Nut";
							if (!treeNutCheck || (treeNutCheck && treeNutAdded == false)) { //if it doesn't start with "Tree Nut" or it does start with "Tree Nut" and Tree Nut hasn't been added yet
								if (treeNutCheck) {
									treeNutAdded = true; //need to keep track that we've already added "tree nut" and not add it numerous times for the different types of tree nut
									hideFoodArray.push((item3['@id']).slice(0,8)); //push only "Tree Nut" part
									} else {
										hideFoodArray.push(item3['@id']);
										}

								}
							});
						jQuery.each(recipeJSON.dietaryChoices.dietaryChoice, function(i3,item3) { //go through each food item for this station
							//console.log(item3['@id'] + " - " + item3['#text']);
							if ((item3['@id']).slice(0,8) == "Contains") { //the ones that start with "Contains" are ones we'd want hidden when someone clicks its checkbox
								hideFoodArray.push((item3['@id']).slice(9)); //remove "Contains " before adding it to the array since "Contains " is assumed and the allergens don't all include that word
								} else { //otherwise it's one to show when clicked
									showFoodArray.push(item3['@id']);
									}
							});
						jQuery.each(recipeJSON.sustainability.dietaryChoice, function(i3,item3) { //go through each food item for this station
							//console.log(item3['@id'] + " - " + item3['#text']);
							showFoodArray.push(item3['@id']);
							});
						hideFoodArray.sort();
						showFoodArray.sort();
						nutrition_checkboxes = '<div class="food-legend"><h2>Food Legend</h2><p>Filter Results to Remove:</p><div class="md:flex remove-menu-options mb-20"><div class="flex-1/3 md:max-w-1/3 pr-10">';
						temp_length_hideFoodArray = hideFoodArray.length;
						temp_hideFoodArrayThird = Math.floor((temp_length_hideFoodArray-1)/3);
						for (var i = 0; i < temp_length_hideFoodArray; i++) {
							temp_food_class = returnNutritionClass(hideFoodArray[i]);
							nutrition_checkboxes += '<div class="food-legend-items"><input name="' + temp_food_class + '" id="' + temp_food_class + '" value="' + temp_food_class + '" type="checkbox"><label class="nutrition-icon ' + temp_food_class + '" for="' + temp_food_class + '">' + hideFoodArray[i] + '</label></div>';
							if (i == temp_hideFoodArrayThird){
									nutrition_checkboxes += '</div><div class="flex-1/3 md:max-w-1/3 pl-10 pr-10">'
									} else if (i == (temp_hideFoodArrayThird * 2)+1) {
											   nutrition_checkboxes += '</div><div class="flex-1/3 md:max-w-1/3 pl-10">'
											   }
							}
						nutrition_checkboxes += '</div></div><p>Show Only the Following Option(s):</p><div class="md:flex show-menu-options"><div class="flex-1/3 md:max-w-1/3 pr-10">';
						temp_length_showFoodArray = showFoodArray.length;
						temp_showFoodArrayThird = Math.floor((temp_length_showFoodArray-1)/3);
						for (var i = 0; i < temp_length_showFoodArray; i++) {
							temp_food_class = returnNutritionClass(showFoodArray[i]);
							nutrition_checkboxes += '<div class="food-legend-items"><input name="' + temp_food_class + '" id="' + temp_food_class + '" value="' + temp_food_class + '" type="checkbox"><label class="nutrition-icon ' + temp_food_class + ' show-menu-item" for="' + temp_food_class + '">' + showFoodArray[i] + '</label></div>';
							if (i == temp_showFoodArrayThird){
									nutrition_checkboxes += '</div><div class="flex-1/3 md:max-w-1/3 pl-10 pr-10">'
									} else if (i == (temp_showFoodArrayThird * 2)+1) {
											   nutrition_checkboxes += '</div><div class="flex-1/3 md:max-w-1/3 pl-10">'
											   }
							}
						nutrition_checkboxes += '</div></div><!--<p>* Cecilâ€™s Choice = Healthy Meal Options</p>--></div>';

						return nutrition_checkboxes;
						}



					function returnFoodIconsHTML (recipeJSON) { //returns the HTML for an individual recipe's food icons
						var hideFoodIconArray = new Array(); //reset array
						var showFoodIconArray = new Array(); //reset array
						var treeNutAdded = false;
						jQuery.each(recipeJSON.allergens.allergen, function(i4,item4) { //go through each food item for this station
							//console.log(item4['@id'] + " - " + item4['#text']);
							var treeNutCheck = (item4['@id']).slice(0,8) == "Tree Nut";
							if (item4['#text'] == "Yes" && (!treeNutCheck || (treeNutCheck && treeNutAdded == false))){ //if the alergen is true and either doesn't start with "Tree Nut" or it does start with "Tree Nut" and Tree Nut hasn't been added yet
								if (treeNutCheck) {
									treeNutAdded = true; //need to keep track that we've already added "tree nut" and not add it numerous times for the different types of tree nut
									hideFoodIconArray.push((item4['@id']).slice(0,8)); //push only "Tree Nut" part
									} else {
										hideFoodIconArray.push(item4['@id']);
										}

								}
							});
						jQuery.each(recipeJSON.dietaryChoices.dietaryChoice, function(i4,item4) { //go through each food item for this station
							//console.log(item4['@id'] + " - " + item4['#text']);
							if (item4['#text'] == "Yes"){
								if ((item4['@id']).slice(0,8) == "Contains") { //the ones that start with "Contains" are ones we'd want hidden when someone clicks its checkbox
									hideFoodIconArray.push((item4['@id']).slice(9)); //remove "Contains " before adding it to the array since "Contains " is assumed and the allergens don't all include that word
									} else { //otherwise it's one to show when clicked
										showFoodIconArray.push(item4['@id']);
										}
								}
							});
						jQuery.each(recipeJSON.sustainability.dietaryChoice, function(i4,item4) { //go through each food item for this station
							//console.log(item4['@id'] + " - " + item4['#text']);
							if (item4['#text'] == "Yes"){
								showFoodIconArray.push(item4['@id']);
								}
							});
						hideFoodIconArray.sort();
						showFoodIconArray.sort();
						icons_temp_html = '';
						for (var i = 0; i < hideFoodIconArray.length; i++) {
							icons_temp_html += '<span class="nutrition-icon ' + returnNutritionClass(hideFoodIconArray[i]) + '" title="' + hideFoodIconArray[i] + '"></span>';
							}
						for (var i = 0; i < showFoodIconArray.length; i++) {
							icons_temp_html +=  '<span class="nutrition-icon ' + returnNutritionClass(showFoodIconArray[i]) + '" title="' + showFoodIconArray[i] + '"></span>';
							if ((showFoodIconArray[i]).toLowerCase() == "vegan") { //items are marked with vegan OR vegetarian, but vegan options are also vegetarian. We need this span so that people selecting vegetarian will still see vegan options
								icons_temp_html +=  '<span class="' + returnNutritionClass("vegetarian") + '"></span>';
								}
							}
						return icons_temp_html;

						}

					function returnNutrientsIngredientsHTML (recipeJSON,showNutrition, showIngredients) { //returns the HTML for an individual recipe's nutrients
						temp_nutrient_values = recipeJSON['@nutrients'];
						nutrients_ingredients_temp_html = '';

						nutrients_ingredients_temp_html += '<button class="nutrition-btn">Nutrition Info</button><div class="nutrition-facts bg-pttrn-lt-grey p-10 mt-10">';

						nutrients_temp_html = '';
						if (showNutrition == true) {
							nutrients_temp_html += '<h4>Nutrition</h4>';
							if (temp_nutrient_values.slice(-1) == '|'){ //remove trailing "|" that later causes an extra element in the array when split() is used
								temp_nutrient_values = temp_nutrient_values.slice(0,-1);
								}
							nutrientsTempValueArray = (temp_nutrient_values).split("|");
							//console.log(nutrientsTempValueArray);
							nutrientsTempValueArray.unshift(recipeJSON['@servingDescription']); //add serving description as the first element, to match "Serving Size" text we added to nutrientsNameArray

							if (nutrientsNameArray.length > nutrientsTempValueArray.length) { //they should be the same length, but just in case, whichever is shorter is how many times we'll loop through
								temp_length_nutrients_array = nutrientsTempValueArray.length;
								} else {
									temp_length_nutrients_array = nutrientsNameArray.length;
									}
							nutrients_temp_html += '<div class="md:flex"><div class="flex-1/2 md:max-w-1/2 pr-10">';
							//console.log(temp_length_nutrients_array);
							for (var i = 0; i < temp_length_nutrients_array; i++) {
								nutrients_temp_html += '<p>' + nutrientsNameArray[i] + ": " + nutrientsTempValueArray[i] + "</p>";
								if (i == Math.floor((temp_length_nutrients_array-1)/2)){
									nutrients_temp_html += '</div><div class="flex-1/2 md:max-w-1/2 pl-10">'
									}
								}
							nutrients_temp_html += '</div></div>'
							}

						ingredients_temp_html = '';
						if (showIngredients == true) {
							ingredients_temp_html += '<p><strong>Ingredients: </strong>' + temp_ingredients + '</p>';
							}
						nutrients_ingredients_temp_html += nutrients_temp_html + ingredients_temp_html + "</div>";

						return nutrients_ingredients_temp_html;
						}

					function returnNutritionClass (fullNutritionName) { //takes the nice name used for the checkboxes and turns it into a class name
						temp_nutrition_class = "nutrition-" + fullNutritionName.replace(/\W/g, '').toLowerCase(); //reamoving anything except alphanumerics and then makes it lowercase
						return temp_nutrition_class;
						}

					function returnNutritionItemHTML (recipeJSON) {
						temp_station_html = '';
						temp_nutrition_approved = recipeJSON['@approvedNutrition'];
						temp_show_ingredients = recipeJSON['@showIngredients'];
						temp_nutrient_values = recipeJSON['@nutrients'];
						temp_ingredients = recipeJSON['ingredients']['#cdata-section'];
						show_nutrition = false;
						show_ingredients = false;
						show_nutrition_info_area = false;

						if(temp_nutrition_approved == 'Yes' && typeof(temp_nutrient_values) != "undefined" && temp_nutrient_values != '') {
						   show_nutrition = true;
						   }

						if(temp_show_ingredients == 'Yes' && typeof(temp_ingredients) != "undefined" && temp_ingredients != '') {
							show_ingredients = true;
							}

						if (show_nutrition == true || show_ingredients == true) {
							show_nutrition_info_area = true;
							}


							//only create html if nutrients are set to show and exist...or...if show ingredients are set to show and they exist
						temp_station_html += '<div class="menu-nutrition-item';
						if (show_nutrition_info_area == false){ //need to add a class so when there is no "Nutrition Info" button the food item and icons can take up the whole width
							temp_station_html += ' menu-wo-facts';
							}
						//console.log(recipeJSON['@shortName']);
						temp_station_html += '"><div class="nutrition-name-icons"><p>' + recipeJSON['@shortName'] + '</p>' + returnFoodIconsHTML(recipeJSON) + '</div>';
						if (show_nutrition_info_area == true){
							temp_station_html += returnNutrientsIngredientsHTML(recipeJSON,show_nutrition,show_ingredients);
							}
						temp_station_html += '</div>';

						return temp_station_html;
						}


					var nutrientsNameArray = new Array(); //will hold nice name of each nutrient
					var mealsForDateArray = new Array(); //setting array that will hold meals for a certain date (different dates could have different meals)
					menuData = data.EatecExchange.menu;
					menuDataLength = menuData.length;
					menuDateRange = new Array(); //will hold nice name of each date
					number_of_date_accordion_headings = 0; //used to detect errors in the feed, as there should never be more than 7, but there would be if the feed is improperly ordered
					feed_dates_out_of_order = false; //this should never happen, so if it does, there's an issue in the feed
					jQuery.each(menuData, function(i,item){ //go through each item (THIS IS WHERE IT STARTS THROUGH THE JSON)
						if (i==0) {//create arrays for nutrient names and hide/show checkboxes - only need to do this once, so might as well on the first item

							temp_nutrients = item['nutrients'];
							if (temp_nutrients.slice(-1) == '|'){ //remove trailing "|" that later causes an extra element in the array when split() is used
								temp_nutrients = temp_nutrients.slice(0,-1);
								}
							//console.log(temp_nutrients);
							var nutrientsUglyNameArray = temp_nutrients.split("|");
							nutrientsNameArray.push("Serving Size"); //we want to manually add this as the first field, and we'll later push the serving size value as the first item in nutrientsTempValueArray (found in returnNutrientsIngredientsHTML function)
							for (var j = 0; j < nutrientsUglyNameArray.length; j++) {
								nutrient = nutrientsUglyNameArray[j].split("~");
								nutrientsNameArray.push(nutrient[0]);
								}

							//console.log(nutrientsNameArray);
							//

							final_menu_html += '<div class="menu-nutrition"><div class="js-accordion" data-accordion-multiselectable="none">';
								//console.log(hideFoodArray);
								//console.log(showFoodArray);
							}

						if (food_legend_html == '' && typeof (item.recipes.closed) == 'undefined') { //if we haven't defined the food legend html and it's not a closed day
							//get options to hide/show when clicking their checkbox
							if (typeof (item.recipes.recipe).length == 'undefined'){ //this station has only one item 
								food_legend_html += returnFoodLegendHTML(item.recipes.recipe);
								} else{ //this station has multiple items
									food_legend_html += returnFoodLegendHTML(item.recipes.recipe[0]);
									}
							}


						if ((temp_date != '' && temp_date != item['@servedate']) || i == menuDataLength-1) { //a bit hacky but lets us figure out the meal anchor tags after going through all the items for a day, add the anchors, and then add the temp_html to the final_menu_html. The only caveat is that it runs at the beginning of a new date which means on the very last one we'll have to do an additional if statement (see much lower) to add in the final temp_html
							//console.log(mealsForDateArray);
							number_of_meals = mealsForDateArray.length;
							for (var k = 0; k < number_of_meals; k++) {
								if (k == 0) {
									final_menu_html += '<div class="menu-jump-to bg-pttrn-lt-grey p-10"><p>Jump to: '+ mealsForDateArray[k];
									}
								if (k > 0) {
									final_menu_html += '<a href="#' + (mealsForDateArray[k]).toLowerCase() + '-' + (temp_date).slice(4,6) + '-' +(temp_date).slice(6,8) + '-' + (temp_date).slice(0,4) + '" aria-label="' + mealsForDateArray[k] + ' - ' + monthNames[temp_date_object.getMonth()] + ' ' + temp_date_object.getDate() + ', ' + temp_date_object.getFullYear() + '">' + mealsForDateArray[k] + '</a>';
									}
								if (k != number_of_meals - 1) {
									final_menu_html += ' | ';
									}
								if (k == number_of_meals - 1) {
									final_menu_html += '</p></div>'
									}
								}

							mealsForDateArray = [];
							final_menu_html += temp_html;
							if (i != menuDataLength-1 || ((temp_date != '' && temp_date != item['@servedate']) && i == menuDataLength-1)) { //This end div needs added if it's not the last time through, or if it is the last time through and the date just changed. If it's the last one and the date did not just change, there is an if below to handle that end div.
								final_menu_html += '</div></div>'; //closing accordion pane
								}
							temp_html = '';
							}

						if(temp_date == '' || temp_date != item['@servedate']) {//this runs on the first date and then whenever the date changes
							if (temp_date != "" && (temp_date_object > new Date((item['@servedate']).slice(0,4) + '-' + (item['@servedate']).slice(4,6) + '-' + (item['@servedate']).slice(6,8) + 'T08:00:00'))) { //need to include the 8 hours to account for UTC to pacific time for some browsers (safari)
								feed_dates_out_of_order = true; //this should never happen, so if it does, it's an error in the feed
								}
								
							temp_date = item['@servedate'];
							temp_meal = ""; //need to do this because it's possible the date changes but the meal from the previous day will be the same as the first from the new day (happens in oldenborg)
							//console.log(temp_date);
							temp_date_object = new Date((temp_date).slice(0,4) + '-' + (temp_date).slice(4,6) + '-' + (temp_date).slice(6,8) + 'T08:00:00'); //need to include the 8 hours to account for UTC to pacific time for some browsers (safari)
							final_menu_html += '<div class="js-accordion__panel" data-accordion-opened="'+ (i==0 ? 'true' : 'false') + '"><h3 class="js-accordion__header font-sans ">' + dayNames[temp_date_object.getDay()] + ', ' + monthNames[temp_date_object.getMonth()] + ' ' + temp_date_object.getDate() + ', ' + temp_date_object.getFullYear() + (typeof (item.recipes.closed) !== 'undefined' ? ' (closed)':'') + '</h3><div class="p-10 lg:p-20 ">'; //date
							number_of_date_accordion_headings++;
							menuDateRange.push(monthNames[temp_date_object.getMonth()] + ' ' + temp_date_object.getDate() + ', ' + temp_date_object.getFullYear());
							}

						if (typeof (item.recipes.closed) == 'undefined'){ //only need to do this if it's not closed
							if(temp_meal == '' || temp_meal != item['@mealperiodname']) {//this runs on the first meal for a date and then whenever the meal changes
								temp_meal = item['@mealperiodname'];
								//console.log(temp_meal);
								temp_html += '<div class="anchor" id="' + temp_meal.toLowerCase() + '-' + (temp_date).slice(4,6) + '-' +(temp_date).slice(6,8) + '-' + (temp_date).slice(0,4) + '"></div>';
								temp_html += "<h2>" + temp_meal + "</h2>"; //meal
								mealsForDateArray.push(temp_meal);

								}
							} else {
								temp_html += '<p class="dining-hall-closed">' + item['@menubulletin'] + '</p>';
								}

						if (typeof (item.recipes.closed) == 'undefined'){ //makes sure it's not closed before going further
							if (typeof (item.recipes.recipe).length == 'undefined'){ //this station has only one item

								//console.log(item.recipes.recipe['@category']);
								temp_html += "<h3>" + item.recipes.recipe['@category'] + "</h3>"; //station name
								//console.log(item.recipes.recipe['@shortName']);

								temp_html += '<div class="nutrition-menu-section">';
								temp_html += returnNutritionItemHTML(item.recipes.recipe);
								temp_html += '</div>'; //meal name
								} else{ //this station has multiple items

									//console.log(item.recipes.recipe[0]['@category']);
									temp_html += "<h3>" + item.recipes.recipe[0]['@category'] + "</h3>"; //station name
									//console.log((item.recipes.recipe).length);
									temp_recipe_count = (item.recipes.recipe).length;
									jQuery.each(item.recipes.recipe, function(i2,item2) { //go through each food item for this station
										if (i2 === 0) {
											temp_html += '<div class="nutrition-menu-section">';
											}
										//console.log(item2['@shortName']);
										temp_html += returnNutritionItemHTML(item2);
										if (i2 === temp_recipe_count - 1) {
											temp_html += '</div>';
											}
										});
								}
							} else {
								//console.log(item.recipes.closed);
								}

						if (i == menuDataLength-1) { //due to how the meals need to be added as anchors, we always push the temp html on the first loop of a new date, but of course on the last item would never get pushed due to no new date, so this is a bit of a hack to push the final content at the end of the loop
							//console.log("almost final_menu_html: " + final_menu_html);
							final_menu_html += temp_html + '</div></div></div></div>'; //ending final day's div, js-accordion__panel, js-accordion, and menu-nutrition
							//console.log("final_menu_html: " + final_menu_html);
							final_menu_html = '<h2 class="menu_week mb-20">' + menuDateRange[0] + ' - '+ menuDateRange[menuDateRange.length -1] + '</h2>' + final_menu_html;
							}

						});
					//console.log(number_of_date_accordion_headings);
					if(number_of_date_accordion_headings > 7 || feed_dates_out_of_order === true) { //there should never be more than 7 accordion headings or dates that are out of order, so if there are, the feed is broken (most likely the ordering is incorrect for the dates and/or meals)
						jQuery("#dining-menu-error").html("<p>There seems to be an error in the menu feed. Please contact Dining Services at (909) 607-9280 or <a href='mailto:dining@pomona.edu'>dining@pomona.edu</a>.</p>");
						} else { //hopefully all is good, so fix things
							menuQueryComplete();
							}

					//below line is just used to test what would happen if the jsonp took a little bit to load (if using this, comment out above line)
					//window.setTimeout(function(){menuQueryComplete()},3000);		
					},
				"error": function(d,msg) {
					console.log("Errored Out: " + d + " : " + msg);
					jQuery("#dining-menu-error").html("<p>Menu loading failed, trying again to load menu." + " (" + number_of_requests + ")</p>");
					if (number_of_requests < 3) {
						pullMenuData(number_of_requests + 1);
						} else {
							jQuery("#dining-menu-error").html('<p>Menu loading failed. Please contact ITS at x18061 or <a href="mailto:servi'+'cedesk@p'+'omona.edu?subject=Dining Menu Down">servicedesk@pomona.edu</a> and let them know about this issue.</p>');
							}
					}
				});
			} // function pullMenuData
		pullMenuData(1);
	 } //end  if (jQuery('#dining-menu-from-json').length)

}); //end ready
