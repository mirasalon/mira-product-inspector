/* LOGIC FOR BASE PRODUCT DETAILS */

function addTag(text, valence='neutral', reviewTag){
    var classList = 'tag ' + valence + (reviewTag ? ' reviewTag' : '')
    return "<div class='" + classList+ "'>" + text + "</div>"
}

function formatAttributeDict(label, dict, reviewTag=true){
    str = "<div class='attributeList'><div class='attributeLabel'><p>" + label + ": </p></div><div class='attributeTags'>"
    str += Object.keys(dict).map(function(key){return addTag(key, dict[key], reviewTag)}).join('')
    str += "</div></div>"
    return str
}

function formatProductAttributes(product){
    attributes = ''
    if(product.tags){
        var tags = {}
        product.tags.forEach(key => tags[key] = 'neutral')
        attributes += formatAttributeDict('Attributes', tags, false)
    }
    if(product.concernInfo){
        var concerns = {}
        if(product.concernInfo.top_concerns) product.concernInfo.top_concerns.map(o => concerns[o.facet] = 'positive')
        if(product.concernInfo.neutral_concerns) product.concernInfo.neutral_concerns.map(o => concerns[o.facet] = 'neutral')
        if(product.concernInfo.bottom_concerns) product.concernInfo.bottom_concerns.map(o => concerns[o.facet] = 'negative')
        if(Object.keys(concerns).length > 0) attributes += formatAttributeDict('Qualities', concerns)
    }
    if(product.skinInfo){
        attributes += formatAttributeDict('Skin Types', product.skinInfo);
    }
    document.getElementById('attributes').innerHTML = attributes;
}

function formatVariation(variation){
    return "<div style='display:flex; flex-direction:column;'><img src='" + variation.swatchUrl + "'/><div>" + variation.name + "</div>"
}

function formatIngredients(ing){
    table_str =  "<table class='ingredients-table'><tr><td>Ingredient Type</td><td>Count</td></tr>"
    table_str += Object.keys(ing.proportions).sort().map(function(x) {return "<tr><td>" + x + "</td><td>" + ing.proportions[x] + "</td></tr>"}).join('')
    table_str += "</table>"
    return table_str
}

function formatBaseDetails(product){
    document.getElementById('id').innerHTML = product.productId
    document.getElementById('name').innerHTML = product.name
    document.getElementById('brand').innerHTML = product.brand
    if (product.numReviews) document.getElementById('numReviews').innerHTML = String(product.numReviews) + " reviews"
    if (product.rating) document.getElementById('rating').innerHTML = String(product.rating).substring(0,3) + " / 5.0"
    document.getElementById('buyButton').onclick = function(){
        chrome.tabs.create({active:true, url:'https://mirabeauty.com' + product.url})
    }
    document.getElementById('buyButton').innerHTML = 'Buy on Mira' + ((product.price && product.price > 0) ? ' ( $' + String(product.price) + ' )' : '')
    // document.getElementById('trackButton').innerHTML = "Track Price"
    // document.getElementById('trackButton').onclick=function(){
    //     document.getElementById('trackButton').innerHTML = "Functionality coming soon! :)"
    // }
    document.getElementById('image').src = "https://mira-product-images.imgix.net/" + product.id + ".png?auto=format&auto=compress&w=300"
    document.getElementById('variations').innerHTML = String(product.variations.length) + ' variations on mirabeauty.com'
    document.getElementById('ingredients').innerHTML = formatIngredients(product.ingredientSummary)
}

function formatProductData(product){
    if (product){
        formatBaseDetails(product);
        formatProductAttributes(product);
    }
}

/* FACET DETAIL DISPLAY LOGIC */

function keyToClassName(key){
    return key.replaceAll(' ', '-').replaceAll('\'', '')
}

function addPercentage(key, value){
    var valence = key === 'positive' ? 'positive' : 'negative'
    return "<div class='percentageInfo'><div class='ratingBar'><div class='ratingBarInner " + valence + "' style='width:" + String(parseInt(String(value*100))) + "%;'></div></div><p class='facetSentimentLabel'>" + String(value*100) + "%</p></div>"
    // return "<p class='facetSentimentLabel'>" + key + " : " + String(value*100) + "% </p>"
}

function formatReviewPercentage(r1, r2){
    var revPerc = String(r1*100.0/r2).slice(0,3)
    if (revPerc[revPerc.length - 1] === '.'){
        revPerc = revPerc.slice(0, revPerc.length-1)
    }
    return revPerc + '%'
}

function formatFacetAnalysisDetails(key, reviewDict, totalReviews){
    str = ''
    if (Object.keys(reviewDict).length > 0){
        str += "<div class='facetAnalysis " + keyToClassName(key) + "'><p class='facetLabel'>" + reviewDict.label + " reviews (" + reviewDict.total_reviews + ")</p>"
        if (reviewDict.label === 'All'){
            // str += "<p class='facetReviewCount'>" + reviewDict.total_reviews + " reviews (" + reviewDict.total_reviews + ")</p>"
        } else {
            // str += "<p class='facetReviewCount'>" + reviewDict.total_reviews + " " + reviewDict.label + " reviews (" + reviewDict.total_</p>"
            str += "<p class='facetReviewCount'>" + formatReviewPercentage(reviewDict.total_reviews, totalReviews) + " of all reviews mentioned " + reviewDict.label.replace('All', '').trim() + "</p>"
        }
        str += "<div class='facetSentiment'>"
        str += Object.keys(reviewDict.pos_neg_hist.pct).reverse().map(function(key){return addPercentage(key, reviewDict.pos_neg_hist.pct[key])}).join('')
        str += "</div></div>"
    }
    return str
}

function formatReviewFilter(key){
    return "<div class='tag reviewTag'>" + key + "</div>"
}

function createReviewFilterFunction(el, displayClass){
    return function(){
        var data = document.getElementsByClassName('facetAnalysis')
        if (el.classList.contains('activeFilter')){
            el.classList.remove('activeFilter');
            for (var i = 0; i < data.length; i++) {
                data[i].classList.remove('hidden')
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                if(!data[i].classList.contains(keyToClassName(displayClass))){
                    data[i].classList.add('hidden')
                } else {
                    data[i].classList.remove('hidden')
                }
            }
            var tags = document.getElementsByClassName('reviewTag')
            for (var i=0; i< tags.length; i++){
                tags[i].classList.remove('activeFilter')
            }
            el.classList.add('activeFilter')
        }
    }
}

function formatSkinToneAttributeTags(reviewData){
    var skin_tone_keys = reviewData.map(function(x){return Object.keys(x)[0].includes('skintone') ? Object.keys(x)[0] : null}).filter(x => x)
    var skin_tone_dict = {}
    skin_tone_keys.forEach(key => skin_tone_dict[key] = 'neutral')
    attributes = formatAttributeDict('Skin Tones', skin_tone_dict);
    document.getElementById('attributes').innerHTML = document.getElementById('attributes').innerHTML + attributes;
}

function formatProductReviewData(reviewData){
    if (reviewData){
        // document.getElementById("reviewFilters").innerHTML = reviewData.map(function(x) {return formatReviewFilter(Object.keys(x)[0])}).join('')
        formatSkinToneAttributeTags(reviewData);
        var tags = document.getElementsByClassName('reviewTag')
        var totalReviews = reviewData[0]['All'][0]['total_reviews']
        for (var i = 0; i < tags.length; i++) {
            tags[i].onclick = createReviewFilterFunction(tags[i], tags[i].innerHTML)
        }
        document.getElementById("reviewData").innerHTML = reviewData.map(function(x){return Object.values(x)[0].map(function(value) {return formatFacetAnalysisDetails(Object.keys(x)[0], value, totalReviews)}).join('')}).join('')

    }
}

/* LOGIC FOR COMMUNICATING WITH CONTENT.JS */

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.message === "product_data"){
            formatProductData(request.product)
            console.log('PRODUCT DATA', request.product)
        } else if(request.message === "product_review_data"){
            console.log('PRODUCT REVIEW DATA', request.review_data);
            formatProductReviewData(request.review_data)
        }
    }
)

let params={active: true, currentWindow: true}
chrome.tabs.query(params, gotTabs);
function gotTabs(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'fetch_product_data'})
}