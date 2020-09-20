function addTag(text, valence='neutral'){
    return "<div class='tag " + valence + "'>" + text + "</div>"
}

function formatAttributeDict(label, dict){
    str = "<div class='attributeList'><div class='attributeLabel'><p>" + label + ": </p></div><div class='attributeTags'>"
    str += Object.keys(dict).map(function(key){return addTag(key, dict[key])}).join('')
    str += "</div></div>"
    return str
}

function formatProductAttributes(product){
    attributes = ''
    if(product.skinInfo){
        attributes += formatAttributeDict('Skin Types', product.skinInfo);
    }
    if(product.tags){
        var tags = {}
        product.tags.forEach(key => tags[key] = 'neutral')
        attributes += formatAttributeDict('Attributes', tags)
    }
    if(product.concernInfo){
        var concerns = {}
        if(product.concernInfo.top_concerns) product.concernInfo.top_concerns.map(o => concerns[o.facet] = 'positive')
        if(product.concernInfo.neutral_concerns) product.concernInfo.neutral_concerns.map(o => concerns[o.facet] = 'neutral')
        if(product.concernInfo.bottom_concerns) product.concernInfo.bottom_concerns.map(o => concerns[o.facet] = 'negative')
        if(Object.keys(concerns).length > 0) attributes += formatAttributeDict('Qualities', concerns)
    }
    console.log('attribute dict', attributes);
    document.getElementById('attributes').innerHTML = attributes;
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
    document.getElementById('buyButton').innerHTML = 'Purchase on Mira' + ((product.price && product.price > 0) ? ' ( $' + String(product.price) + ' )' : '')
    document.getElementById('trackButton').innerHTML = "Track Price"
    document.getElementById('trackButton').onclick=function(){
        document.getElementById('trackButton').innerHTML = "Functionality coming soon! :)"
    }
    document.getElementById('image').src = product.imageUrl
}

function formatProductData(product){
    if (product){
        formatBaseDetails(product);
        formatProductAttributes(product);
    }
}

function formatProductReviewString(reviewString){
    if (reviewString){
        document.getElementById("reviewString").innerHTML = reviewString.replace(/\n/g, "<br />").replace("  ", "&nbsp;&nbsp;&nbsp;")
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.message === "product_data"){
            formatProductData(request.product)
        } else if(request.message === "product_review_string"){
            formatProductReviewString(request.review_string)
        }
    }
)

let params={active: true, currentWindow: true}
chrome.tabs.query(params, gotTabs);
function gotTabs(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'fetch_product_data'})
}